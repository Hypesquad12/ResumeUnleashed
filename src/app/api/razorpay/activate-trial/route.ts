import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { indiaPricing, rowPricing } from '@/lib/pricing-config'
import { getUsdToInrRate } from '@/lib/currency'

/**
 * Detect payment method (card or upi) from subscription and customer data
 * This determines which upgrade flow to use
 */
async function detectPaymentMethod(razorpaySubscription: any, auth: string): Promise<'card' | 'upi'> {
  try {
    // Check subscription notes first
    if (razorpaySubscription.notes?.payment_method) {
      return razorpaySubscription.notes.payment_method === 'card' ? 'card' : 'upi'
    }

    // Fetch customer tokens to determine payment method
    if (razorpaySubscription.customer_id) {
      const tokensResponse = await fetch(
        `https://api.razorpay.com/v1/customers/${razorpaySubscription.customer_id}/tokens`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Basic ${auth}`,
          },
        }
      )

      if (tokensResponse.ok) {
        const tokensData = await tokensResponse.json()
        if (tokensData.items && tokensData.items.length > 0) {
          const token = tokensData.items[0]
          // Check token method - card or vpa (UPI)
          if (token.method === 'card') {
            return 'card'
          } else if (token.method === 'upi' || token.vpa) {
            return 'upi'
          }
        }
      }
    }

    // Default to UPI (safer - uses cancel+recreate which works for both)
    console.log('[DETECT-PAYMENT-METHOD] Could not determine payment method, defaulting to UPI flow')
    return 'upi'
  } catch (error) {
    console.error('[DETECT-PAYMENT-METHOD] Error detecting payment method:', error)
    return 'upi' // Fallback to UPI flow
  }
}

/**
 * Activate trial subscription by charging the mandate immediately
 * This is called when trial users hit their limit and want to activate full plan
 */
export async function POST() {
  try {
    console.log('[ACTIVATE-TRIAL] Starting trial activation...')
    
    const supabase = await createClient()
    console.log('[ACTIVATE-TRIAL] Supabase client created')
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    console.log('[ACTIVATE-TRIAL] Auth check:', { userId: user?.id, hasError: !!authError })

    if (authError || !user) {
      console.log('[ACTIVATE-TRIAL] Auth failed:', authError)
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get user's active subscription (includes authenticated status after mandate setup)
    console.log('[ACTIVATE-TRIAL] Fetching subscription for user:', user.id)
    const { data: subscription, error: subError } = await (supabase as any)
      .from('subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .in('status', ['active', 'authenticated'])
      .single()

    console.log('[ACTIVATE-TRIAL] Subscription query result:', { 
      hasSubscription: !!subscription, 
      hasError: !!subError,
      subscriptionId: subscription?.id,
      razorpaySubId: subscription?.razorpay_subscription_id
    })

    if (subError || !subscription) {
      console.log('[ACTIVATE-TRIAL] No subscription found:', subError)
      return NextResponse.json(
        { error: 'No active subscription found' },
        { status: 404 }
      )
    }

    // Check if trial is active
    if (!subscription.trial_active) {
      console.log('[ACTIVATE-TRIAL] Trial not active')
      return NextResponse.json(
        { error: 'Trial already completed' },
        { status: 400 }
      )
    }

    // Get Razorpay subscription details
    console.log('[ACTIVATE-TRIAL] Checking Razorpay credentials...')
    const razorpayApiKey = process.env.RAZORPAY_KEY_ID
    const razorpayApiSecret = process.env.RAZORPAY_KEY_SECRET
    
    if (!razorpayApiKey || !razorpayApiSecret) {
      console.error('[ACTIVATE-TRIAL] Missing Razorpay credentials')
      return NextResponse.json(
        { error: 'Payment service not configured' },
        { status: 500 }
      )
    }
    
    console.log('[ACTIVATE-TRIAL] Razorpay credentials found')
    const auth = Buffer.from(`${razorpayApiKey}:${razorpayApiSecret}`).toString('base64')

    // Verify Razorpay subscription status first
    console.log('[ACTIVATE-TRIAL] Fetching Razorpay subscription status:', subscription.razorpay_subscription_id)
    const statusResponse = await fetch(
      `https://api.razorpay.com/v1/subscriptions/${subscription.razorpay_subscription_id}`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Basic ${auth}`,
        },
      }
    )

    console.log('[ACTIVATE-TRIAL] Razorpay status response:', statusResponse.status)

    if (!statusResponse.ok) {
      console.error('[ACTIVATE-TRIAL] Failed to fetch Razorpay subscription status:', statusResponse.status)
      return NextResponse.json(
        { error: 'Failed to verify subscription status' },
        { status: 500 }
      )
    }

    const razorpaySubscription = await statusResponse.json()
    console.log('[ACTIVATE-TRIAL] Razorpay subscription data:', { 
      status: razorpaySubscription.status,
      id: razorpaySubscription.id,
      customer_id: razorpaySubscription.customer_id
    })
    
    // Check if mandate is authenticated
    if (razorpaySubscription.status === 'created') {
      return NextResponse.json(
        { 
          error: 'Please complete the mandate authentication first. Click the payment link sent to your email or visit your subscription settings.',
          errorCode: 'MANDATE_NOT_AUTHENTICATED',
          shortUrl: razorpaySubscription.short_url
        },
        { status: 400 }
      )
    }

    // If subscription is cancelled, we'll create a new one below
    // For other invalid statuses, return error
    if (razorpaySubscription.status !== 'authenticated' && 
        razorpaySubscription.status !== 'active' && 
        razorpaySubscription.status !== 'cancelled') {
      return NextResponse.json(
        { 
          error: `Subscription is ${razorpaySubscription.status}. Cannot activate trial at this time.`,
          errorCode: 'INVALID_SUBSCRIPTION_STATUS'
        },
        { status: 400 }
      )
    }

    // Detect payment method to determine upgrade flow
    // Cards: Use Invoice API for immediate charge (no cancel/recreate)
    // UPI: Use cancel+recreate (UPI limitation - cannot charge manually)
    const paymentMethod = await detectPaymentMethod(razorpaySubscription, auth)
    console.log('[ACTIVATE-TRIAL] Detected payment method:', paymentMethod)

    // Get base URL for callbacks
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://resumeunleashed.com'

    // Get correct pricing based on tier and region
    let planAmount: number
    if (subscription.region === 'row') {
      // ROW: Get USD price and convert to INR
      const tierPricing = rowPricing.find(p => p.tier === subscription.tier)
      const monthlyPriceUsd = tierPricing?.priceMonthly || 12.99
      const annualPriceUsd = tierPricing?.priceAnnual || 116.91
      const exchangeRate = await getUsdToInrRate()
      const priceUsd = subscription.billing_cycle === 'annual' ? annualPriceUsd : monthlyPriceUsd
      planAmount = Math.round(priceUsd * exchangeRate * 100) // Convert to paise
      console.log('[ACTIVATE-TRIAL] ROW pricing:', { tier: subscription.tier, priceUsd, exchangeRate, planAmount })
    } else {
      // India: Use INR price directly
      const tierPricing = indiaPricing.find(p => p.tier === subscription.tier)
      const monthlyPrice = tierPricing?.priceMonthly || 799
      const annualPrice = tierPricing?.priceAnnual || 7191
      planAmount = subscription.billing_cycle === 'annual' ? annualPrice * 100 : monthlyPrice * 100 // Amount in paise
      console.log('[ACTIVATE-TRIAL] India pricing:', { tier: subscription.tier, monthlyPrice, annualPrice, planAmount })
    }

    // FLOW 1: CARDS - Create invoice and charge on existing mandate
    if (paymentMethod === 'card') {
      console.log('[ACTIVATE-TRIAL] Using Cards flow - creating invoice for immediate charge')
      
      // Create invoice to charge on existing card mandate
      const invoiceResponse = await fetch(
        'https://api.razorpay.com/v1/invoices',
        {
          method: 'POST',
          headers: {
            'Authorization': `Basic ${auth}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            type: 'invoice',
            customer_id: razorpaySubscription.customer_id,
            amount: planAmount,
            currency: 'INR',
            description: `Subscription activation - ${subscription.tier} plan (${subscription.billing_cycle})`,
            subscription_id: subscription.razorpay_subscription_id,
          })
        }
      )

      if (!invoiceResponse.ok) {
        const errorData = await invoiceResponse.json()
        console.error('[ACTIVATE-TRIAL] Invoice creation error:', errorData)
        return NextResponse.json(
          { error: errorData.error?.description || 'Failed to create payment invoice' },
          { status: 500 }
        )
      }

      const invoice = await invoiceResponse.json()
      console.log('[ACTIVATE-TRIAL] Invoice created:', invoice.id)

      // Update database - mark trial as inactive
      const { error: updateError } = await supabase
        .from('subscriptions')
        .update({ 
          trial_active: false,
          updated_at: new Date().toISOString()
        })
        .eq('id', subscription.id)

      if (updateError) {
        console.error('[ACTIVATE-TRIAL] Database update error:', updateError)
      }

      return NextResponse.json({
        success: true,
        message: 'Payment initiated. Charging your card now.',
        invoiceId: invoice.id,
        shortUrl: invoice.short_url,
        paymentMethod: 'card'
      })
    }

    // FLOW 2: UPI - Use Payment Link for immediate payment
    // Payment Links support callback_url and charge full amount immediately
    console.log('[ACTIVATE-TRIAL] Using UPI flow - creating payment link for immediate charge')
    
    const paymentLinkResponse = await fetch(
      'https://api.razorpay.com/v1/payment_links',
      {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: planAmount,
          currency: 'INR',
          accept_partial: false,
          description: `Subscription activation - ${subscription.tier} plan (${subscription.billing_cycle})`,
          customer: {
            email: user.email,
            contact: user.phone || undefined,
          },
          notify: {
            email: true,
            sms: true,
          },
          reminder_enable: true,
          callback_url: `${baseUrl}/conversion/mandate-success?type=payment`,
          callback_method: 'get',
          notes: {
            user_id: user.id,
            subscription_id: subscription.id,
            tier: subscription.tier,
            billing_cycle: subscription.billing_cycle,
            activated_early: 'true',
          }
        })
      }
    )

    if (!paymentLinkResponse.ok) {
      const errorData = await paymentLinkResponse.json()
      console.error('[ACTIVATE-TRIAL] Payment link creation error:', errorData)
      throw new Error(errorData.error?.description || 'Failed to create payment link')
    }

    const paymentLink = await paymentLinkResponse.json()
    console.log('[ACTIVATE-TRIAL] Payment link created:', {
      id: paymentLink.id,
      short_url: paymentLink.short_url,
      amount: paymentLink.amount
    })

    // Update database - mark trial as pending payment
    const { error: updateError } = await supabase
      .from('subscriptions')
      .update({ 
        trial_active: false,
        updated_at: new Date().toISOString()
      })
      .eq('id', subscription.id)

    if (updateError) {
      console.error('Failed to update subscription in database:', updateError)
    }

    return NextResponse.json({
      success: true,
      message: 'Payment link created. Please complete payment.',
      paymentLinkId: paymentLink.id,
      shortUrl: paymentLink.short_url,
      amount: paymentLink.amount / 100,
      paymentMethod: 'upi'
    })

  } catch (error) {
    console.error('[ACTIVATE-TRIAL] Caught error:', error)
    console.error('[ACTIVATE-TRIAL] Error stack:', error instanceof Error ? error.stack : 'No stack')
    console.error('[ACTIVATE-TRIAL] Error type:', typeof error)
    console.error('[ACTIVATE-TRIAL] Error details:', JSON.stringify(error, null, 2))
    
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Failed to activate subscription',
        details: error instanceof Error ? error.stack : String(error)
      },
      { status: 500 }
    )
  }
}
