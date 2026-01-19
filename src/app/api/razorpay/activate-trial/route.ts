import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * Activate trial subscription by charging the mandate immediately
 * This is called when trial users hit their limit and want to activate full plan
 */
export async function POST() {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get user's active subscription (includes authenticated status after mandate setup)
    const { data: subscription, error: subError } = await (supabase as any)
      .from('subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .in('status', ['active', 'authenticated'])
      .single()

    if (subError || !subscription) {
      return NextResponse.json(
        { error: 'No active subscription found' },
        { status: 404 }
      )
    }

    // Check if trial is active
    if (!subscription.trial_active) {
      return NextResponse.json(
        { error: 'Trial already completed' },
        { status: 400 }
      )
    }

    // Get Razorpay subscription details
    const razorpayApiKey = process.env.RAZORPAY_KEY_ID!
    const razorpayApiSecret = process.env.RAZORPAY_KEY_SECRET!
    const auth = Buffer.from(`${razorpayApiKey}:${razorpayApiSecret}`).toString('base64')

    // Verify Razorpay subscription status first
    const statusResponse = await fetch(
      `https://api.razorpay.com/v1/subscriptions/${subscription.razorpay_subscription_id}`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Basic ${auth}`,
        },
      }
    )

    if (!statusResponse.ok) {
      console.error('Failed to fetch Razorpay subscription status')
      return NextResponse.json(
        { error: 'Failed to verify subscription status' },
        { status: 500 }
      )
    }

    const razorpaySubscription = await statusResponse.json()
    
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
    console.error('Activate trial error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to activate subscription' },
      { status: 500 }
    )
  }
}
