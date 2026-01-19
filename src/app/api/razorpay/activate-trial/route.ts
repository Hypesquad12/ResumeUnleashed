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

    // Charge the subscription immediately (skip remaining trial days)
    const chargeResponse = await fetch(
      `https://api.razorpay.com/v1/subscriptions/${subscription.razorpay_subscription_id}/charge`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/json',
        },
      }
    )

    if (!chargeResponse.ok) {
      const errorData = await chargeResponse.json()
      console.error('Razorpay charge error:', errorData)
      throw new Error(errorData.error?.description || 'Failed to charge subscription')
    }

    const chargeData = await chargeResponse.json()

    // Update subscription to mark trial as inactive
    const { error: updateError } = await supabase
      .from('subscriptions')
      .update({ 
        trial_active: false,
        updated_at: new Date().toISOString()
      })
      .eq('id', subscription.id)

    if (updateError) {
      console.error('Failed to update trial status:', updateError)
    }

    return NextResponse.json({
      success: true,
      message: 'Subscription activated successfully',
      paymentId: chargeData.id
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
