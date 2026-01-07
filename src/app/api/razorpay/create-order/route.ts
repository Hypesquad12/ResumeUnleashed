import { NextRequest, NextResponse } from 'next/server'
import { getRazorpayInstance } from '@/lib/razorpay'
import { createClient } from '@/lib/supabase/server'
import { Region, BillingCycle, SubscriptionTier } from '@/lib/pricing-config'
import { convertUsdToInr, getUsdToInrRate } from '@/lib/currency'
import { indiaPricing, rowPricing } from '@/lib/pricing-config'

// UPI Recurring Order with immediate full payment
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { planId, billingCycle, region, tier, couponCode } = body as {
      planId: string
      billingCycle: BillingCycle
      region: Region
      tier: SubscriptionTier
      couponCode?: string
    }

    // Validate input
    if (!planId || !billingCycle || !region || !tier) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const razorpay = getRazorpayInstance()

    // Calculate plan amount
    let planAmount = 0
    let exchangeRate = 0
    let usdPrice = 0

    if (region === 'india') {
      const plan = indiaPricing.find(p => p.tier === tier)
      if (!plan) {
        return NextResponse.json({ error: 'Plan not found' }, { status: 400 })
      }
      planAmount = billingCycle === 'monthly' ? plan.priceMonthly : plan.priceAnnual
    } else {
      const plan = rowPricing.find(p => p.tier === tier)
      if (!plan) {
        return NextResponse.json({ error: 'Plan not found' }, { status: 400 })
      }
      usdPrice = billingCycle === 'monthly' ? plan.priceMonthly : plan.priceAnnual
      exchangeRate = await getUsdToInrRate()
      planAmount = Math.round(usdPrice * exchangeRate)
    }

    // Apply coupon discount if provided
    let discountAmount = 0
    let finalAmount = planAmount
    let couponDetails = null

    if (couponCode) {
      // Validate coupon
      const couponResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/razorpay/validate-coupon`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ couponCode, planAmount }),
      })

      if (couponResponse.ok) {
        const couponData = await couponResponse.json()
        if (couponData.valid) {
          discountAmount = couponData.discountAmount
          finalAmount = couponData.finalAmount
          couponDetails = {
            code: couponData.couponCode,
            discount: couponData.discount,
            type: couponData.discountType,
            amount: discountAmount,
          }
        }
      }
    }

    // Convert to paise
    const amountInPaise = finalAmount * 100

    // Create Razorpay order for UPI Recurring (AutoPay)
    const order = await razorpay.orders.create({
      amount: amountInPaise,
      currency: 'INR',
      receipt: `order_${user.id}_${Date.now()}`,
      notes: {
        user_id: user.id,
        user_email: user.email || '',
        plan_id: planId,
        region,
        tier,
        billing_cycle: billingCycle,
        original_amount: planAmount.toString(),
        discount_amount: discountAmount.toString(),
        final_amount: finalAmount.toString(),
        ...(couponDetails && {
          coupon_code: couponDetails.code,
          coupon_discount: couponDetails.discount.toString(),
          coupon_type: couponDetails.type,
        }),
        ...(region === 'row' && {
          usd_price: usdPrice.toString(),
          exchange_rate: exchangeRate.toString(),
        }),
      },
    }) as any

    console.log('Razorpay order created:', order.id)

    // Store order in database
    const periodStart = new Date()
    const periodEnd = new Date()
    if (billingCycle === 'annual') {
      periodEnd.setFullYear(periodEnd.getFullYear() + 1)
    } else {
      periodEnd.setMonth(periodEnd.getMonth() + 1)
    }

    const { error: dbError } = await supabase
      .from('subscriptions')
      .upsert({
        user_id: user.id,
        plan_id: planId,
        razorpay_order_id: order.id,
        razorpay_subscription_id: null, // Will be updated after UPI mandate creation
        razorpay_customer_id: null,
        status: 'pending',
        billing_cycle: billingCycle,
        current_period_start: periodStart.toISOString(),
        current_period_end: periodEnd.toISOString(),
        metadata: couponDetails ? {
          coupon_code: couponDetails.code,
          discount_applied: discountAmount,
          original_amount: planAmount,
        } : null,
      }, {
        onConflict: 'user_id'
      })

    if (dbError) {
      console.error('Database error:', dbError)
      return NextResponse.json({ error: 'Failed to save order' }, { status: 500 })
    }

    return NextResponse.json({
      orderId: order.id,
      amount: finalAmount,
      currency: 'INR',
      keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
      userName: user.email?.split('@')[0] || 'User',
      userEmail: user.email || '',
      userPhone: '', // Add phone if available
      couponApplied: couponDetails !== null,
      discountAmount,
      originalAmount: planAmount,
    })

  } catch (error: any) {
    console.error('Order creation error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create order' },
      { status: 500 }
    )
  }
}
