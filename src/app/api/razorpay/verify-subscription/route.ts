import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import crypto from 'crypto'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { razorpay_payment_id, razorpay_subscription_id, razorpay_signature } = body

    if (!razorpay_payment_id || !razorpay_subscription_id || !razorpay_signature) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      )
    }

    // Verify signature
    const secret = process.env.RAZORPAY_KEY_SECRET
    if (!secret) {
      console.error('RAZORPAY_KEY_SECRET not configured')
      return NextResponse.json(
        { error: 'Configuration error' },
        { status: 500 }
      )
    }

    const generatedSignature = crypto
      .createHmac('sha256', secret)
      .update(`${razorpay_payment_id}|${razorpay_subscription_id}`)
      .digest('hex')

    if (generatedSignature !== razorpay_signature) {
      console.error('Invalid signature')
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 400 }
      )
    }

    // Get user and update subscription
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get subscription details to extract tier
    const { data: subscriptionData } = await supabase
      .from('subscriptions')
      .select('plan_id, billing_cycle')
      .eq('user_id', user.id)
      .single()

    // Update subscription status to authenticated
    const { error: updateError } = await supabase
      .from('subscriptions')
      .update({
        status: 'authenticated',
        razorpay_subscription_id: razorpay_subscription_id,
      })
      .eq('user_id', user.id)

    if (updateError) {
      console.error('Failed to update subscription:', updateError)
      return NextResponse.json(
        { error: 'Failed to update subscription' },
        { status: 500 }
      )
    }

    // Extract tier from plan_id (format: plan_RyecfdilZvSwQR)
    // We need to determine tier from the subscription notes stored during creation
    // For now, set a default tier that will be updated by webhook
    // The webhook will set the proper tier when subscription.activated event fires
    
    console.log(`Subscription authenticated: ${razorpay_subscription_id} for user ${user.id}`)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Subscription verification error:', error)
    return NextResponse.json(
      { error: 'Verification failed' },
      { status: 500 }
    )
  }
}
