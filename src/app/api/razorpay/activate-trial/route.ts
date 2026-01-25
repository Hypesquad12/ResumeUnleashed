import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

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
      id: razorpaySubscription.id 
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

    if (razorpaySubscription.status !== 'authenticated' && razorpaySubscription.status !== 'active') {
      return NextResponse.json(
        { 
          error: `Subscription is ${razorpaySubscription.status}. Cannot activate trial at this time.`,
          errorCode: 'INVALID_SUBSCRIPTION_STATUS'
        },
        { status: 400 }
      )
    }

    // Cancel existing subscription and create new one with immediate charge
    // This approach avoids "payment mode is up" errors from Razorpay
    console.log('[ACTIVATE-TRIAL] Cancelling existing subscription:', subscription.razorpay_subscription_id)
    
    const cancelResponse = await fetch(
      `https://api.razorpay.com/v1/subscriptions/${subscription.razorpay_subscription_id}/cancel`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          cancel_at_cycle_end: 0 // Cancel immediately
        })
      }
    )

    if (!cancelResponse.ok) {
      const errorData = await cancelResponse.json()
      console.error('[ACTIVATE-TRIAL] Cancel error:', errorData)
      // Continue anyway - we'll try to create a new subscription
    } else {
      console.log('[ACTIVATE-TRIAL] Subscription cancelled successfully')
    }

    // Create new subscription with immediate charge (start_at = now + 5 seconds)
    // Pass customer_id to reuse existing mandate and avoid re-authentication
    console.log('[ACTIVATE-TRIAL] Creating new subscription with immediate charge...')
    const currentTimestamp = Math.floor(Date.now() / 1000) + 5 // Start in 5 seconds
    
    // Get callback URL for redirect after payment
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://resumeunleashed.com'
    
    const subscriptionBody: any = {
      plan_id: subscription.plan_id,
      total_count: subscription.billing_cycle === 'annual' ? 1 : 12,
      quantity: 1,
      customer_notify: 1,
      start_at: currentTimestamp,
      callback_url: `${baseUrl}/conversion/mandate-success?type=payment`,
      notify_info: {
        notify_email: user.email,
        notify_phone: user.phone || undefined
      },
      notes: {
        user_id: user.id,
        plan_id: subscription.tier === 'premium' ? 'india-premium' : 'india-pro',
        region: subscription.region,
        tier: subscription.tier,
        billing_cycle: subscription.billing_cycle,
        trial_days: '0',
        returning_customer: 'true',
        activated_early: 'true'
      }
    }
    
    // Add customer_id if available to reuse existing mandate
    if (razorpaySubscription.customer_id) {
      subscriptionBody.customer_id = razorpaySubscription.customer_id
      console.log('[ACTIVATE-TRIAL] Reusing customer_id:', razorpaySubscription.customer_id)
    }
    
    const newSubResponse = await fetch(
      'https://api.razorpay.com/v1/subscriptions',
      {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(subscriptionBody)
      }
    )

    if (!newSubResponse.ok) {
      const errorData = await newSubResponse.json()
      console.error('[ACTIVATE-TRIAL] Create new subscription error:', errorData)
      throw new Error(errorData.error?.description || 'Failed to create new subscription')
    }

    const newSubscription = await newSubResponse.json()
    console.log('[ACTIVATE-TRIAL] New subscription created:', {
      id: newSubscription.id,
      status: newSubscription.status,
      start_at: newSubscription.start_at,
      short_url: newSubscription.short_url
    })

    // Update database with new subscription ID and mark trial as inactive
    const { error: updateError } = await supabase
      .from('subscriptions')
      .update({ 
        razorpay_subscription_id: newSubscription.id,
        status: 'authenticated',
        trial_active: false,
        updated_at: new Date().toISOString()
      })
      .eq('id', subscription.id)

    if (updateError) {
      console.error('Failed to update subscription in database:', updateError)
    }

    return NextResponse.json({
      success: true,
      message: 'Subscription activated successfully. Please complete mandate authentication.',
      subscriptionId: newSubscription.id,
      status: newSubscription.status,
      shortUrl: newSubscription.short_url,
      requiresAuthentication: newSubscription.status === 'created'
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
