import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import crypto from 'crypto'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { razorpay_payment_id, razorpay_subscription_id, razorpay_signature } = body

    // For mandate authentication, payment_id may not be present yet
    if (!razorpay_subscription_id || !razorpay_signature) {
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

    // For mandate authentication (no payment yet), signature is just subscription_id
    // For actual payment, signature includes payment_id|subscription_id
    const signaturePayload = razorpay_payment_id 
      ? `${razorpay_payment_id}|${razorpay_subscription_id}`
      : razorpay_subscription_id

    const generatedSignature = crypto
      .createHmac('sha256', secret)
      .update(signaturePayload)
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

    // Get subscription details to extract tier and trial info
    const { data: subscriptionData, error: fetchError } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (fetchError) {
      console.error('Failed to fetch subscription:', fetchError)
      return NextResponse.json(
        { error: `Failed to fetch subscription: ${fetchError.message}` },
        { status: 500 }
      )
    }

    if (!subscriptionData) {
      console.error('No subscription found for user:', user.id)
      return NextResponse.json(
        { error: 'No subscription found for this user' },
        { status: 404 }
      )
    }

    console.log('Found subscription:', subscriptionData)

    // Check trial eligibility
    const trialDays = (subscriptionData as any).trial_days || 0
    const isTrialActive = trialDays > 0

    // Update subscription status to authenticated
    const { data: updatedData, error: updateError } = await supabase
      .from('subscriptions')
      .update({
        status: 'authenticated',
        razorpay_subscription_id: razorpay_subscription_id,
        trial_active: isTrialActive,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', user.id)
      .select()

    if (updateError) {
      console.error('Failed to update subscription:', updateError)
      console.error('Update error details:', JSON.stringify(updateError, null, 2))
      return NextResponse.json(
        { error: `Failed to update subscription: ${updateError.message}` },
        { status: 500 }
      )
    }

    console.log('Updated subscription:', updatedData)

    // Determine if this is mandate authentication (initial setup) or actual payment
    const isAuthentication = isTrialActive

    console.log(`Subscription ${isAuthentication ? 'authenticated (mandate setup)' : 'payment verified'}: ${razorpay_subscription_id} for user ${user.id}`)
    console.log(`Trial active: ${isTrialActive}, Payment ID present: ${!!razorpay_payment_id}`)

    return NextResponse.json({ 
      success: true,
      isAuthentication,
      message: isAuthentication ? 'Mandate authenticated successfully' : 'Payment verified successfully'
    })
  } catch (error) {
    console.error('Subscription verification error:', error)
    return NextResponse.json(
      { error: 'Verification failed' },
      { status: 500 }
    )
  }
}
