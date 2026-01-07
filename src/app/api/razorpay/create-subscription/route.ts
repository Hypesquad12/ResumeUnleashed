import { NextRequest, NextResponse } from 'next/server'
import { getRazorpayInstance, RAZORPAY_PLAN_IDS } from '@/lib/razorpay'
import { createClient } from '@/lib/supabase/server'
import { Region, BillingCycle, SubscriptionTier, rowPricing } from '@/lib/pricing-config'
import { convertUsdToInr, getUsdToInrRate } from '@/lib/currency'

// Razorpay subscription response type
interface RazorpaySubscriptionResponse {
  id: string
  short_url: string
  status: string
}

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

    // For ROW region, calculate amount using live exchange rate
    let planAmount = 0
    let exchangeRate = 0
    let razorpayPlanId = ''

    if (region === 'india') {
      // India: Use predefined plan IDs with fixed INR amounts
      const razorpayPlanKey = `${tier}_${billingCycle}` as keyof typeof RAZORPAY_PLAN_IDS.india
      razorpayPlanId = RAZORPAY_PLAN_IDS.india[razorpayPlanKey]

      if (!razorpayPlanId) {
        console.error('Razorpay plan not found:', { region, tier, billingCycle })
        return NextResponse.json(
          { error: 'Razorpay plan not configured' },
          { status: 500 }
        )
      }
    } else {
      // ROW: Create plan dynamically with live exchange rate
      // Find the USD price for this plan
      const rowPlan = rowPricing.find(p => 
        p.tier === tier && 
        (billingCycle === 'monthly' ? p.priceMonthly > 0 : p.priceAnnual > 0)
      )

      if (!rowPlan) {
        return NextResponse.json(
          { error: 'Plan not found' },
          { status: 400 }
        )
      }

      const usdPrice = billingCycle === 'monthly' ? rowPlan.priceMonthly : rowPlan.priceAnnual
      
      // Get live exchange rate and convert to INR
      exchangeRate = await getUsdToInrRate()
      planAmount = Math.round(usdPrice * exchangeRate * 100) // Convert to paise

      console.log('ROW subscription:', {
        usdPrice,
        exchangeRate,
        inrAmount: planAmount / 100,
        tier,
        billingCycle
      })

      // Create a Razorpay plan with the calculated amount
      const planName = `${tier.charAt(0).toUpperCase() + tier.slice(1)} ${billingCycle.charAt(0).toUpperCase() + billingCycle.slice(1)} (Global)`
      const period = billingCycle === 'monthly' ? 'monthly' : 'yearly'
      const interval = 1

      try {
        const plan = await razorpay.plans.create({
          period,
          interval,
          item: {
            name: planName,
            amount: planAmount,
            currency: 'INR',
            description: `${rowPlan.limits.resumes === -1 ? 'Unlimited' : rowPlan.limits.resumes} resumes, ${rowPlan.limits.customizations} customizations`,
          },
          notes: {
            tier,
            billing_cycle: billingCycle,
            region,
            usd_price: usdPrice.toString(),
            exchange_rate: exchangeRate.toString(),
            created_at: new Date().toISOString(),
          },
        }) as any

        razorpayPlanId = plan.id
        console.log('Created dynamic Razorpay plan:', razorpayPlanId)
      } catch (planError: any) {
        console.error('Failed to create Razorpay plan:', planError)
        return NextResponse.json(
          { error: 'Failed to create subscription plan' },
          { status: 500 }
        )
      }
    }

    // Create subscription using Razorpay API
    // IMPORTANT: Do NOT pass customer_id - it breaks hosted checkout link generation
    // Razorpay will create customer automatically during payment authentication
    // Minimal delay required by Razorpay for hosted checkout - charges within 1 minute of authentication
    const immediateStart = Math.floor(Date.now() / 1000) + 60 // Start 1 minute from now (minimum for Razorpay)
    
    const subscriptionParams = {
      plan_id: razorpayPlanId,
      total_count: billingCycle === 'annual' ? 1 : 12,
      quantity: 1,
      customer_notify: 1,
      start_at: immediateStart, // Start immediately after authentication
      addons: [], // Explicitly set empty addons
      notes: {
        user_id: user.id,
        user_email: user.email || '',
        plan_id: planId,
        region,
        tier,
        billing_cycle: billingCycle,
        ...(region === 'row' && {
          exchange_rate: exchangeRate.toString(),
          plan_amount_inr: (planAmount / 100).toString(),
        }),
      },
    }

    console.log('Creating Razorpay subscription with params:', subscriptionParams)

    const subscription = await razorpay.subscriptions.create(
      subscriptionParams as any
    ) as unknown as RazorpaySubscriptionResponse

    console.log('Razorpay subscription created:', subscription.id)
    console.log('Razorpay subscription response:', JSON.stringify(subscription, null, 2))

    // Store subscription in database (pending status until payment)
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
        plan_id: razorpayPlanId, // Use Razorpay plan ID, not frontend plan ID
        razorpay_subscription_id: subscription.id,
        razorpay_customer_id: null, // Will be updated by webhook after authentication
        status: 'pending',
        billing_cycle: billingCycle,
        current_period_start: periodStart.toISOString(),
        current_period_end: periodEnd.toISOString(),
      }, {
        onConflict: 'user_id' // Specify which column to use for upsert conflict resolution
      })

    if (dbError) {
      console.error('Database error:', dbError)
      return NextResponse.json({ error: 'Failed to save subscription' }, { status: 500 })
    }

    console.log('Returning response:', {
      subscriptionId: subscription.id,
      shortUrl: subscription.short_url,
    })

    return NextResponse.json({
      subscriptionId: subscription.id,
      shortUrl: subscription.short_url,
    })
  } catch (error: any) {
    console.error('Subscription creation error:', error)
    console.error('Error details:', {
      message: error.message,
      description: error.description,
      statusCode: error.statusCode,
      error: error.error,
    })
    
    // Return more detailed error message
    const errorMessage = error.description || error.message || 'Failed to create subscription'
    return NextResponse.json(
      { error: errorMessage, details: error.error },
      { status: 500 }
    )
  }
}
