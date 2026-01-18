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

    // Get user's active subscription
    const { data: subscription, error: subError } = await (supabase as any)
      .from('subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'active')
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
