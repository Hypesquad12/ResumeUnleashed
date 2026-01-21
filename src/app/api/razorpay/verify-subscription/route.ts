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

    // Get subscription details to extract tier
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

    // Update subscription status to authenticated
    const { data: updatedData, error: updateError } = await supabase
      .from('subscriptions')
      .update({
        status: 'authenticated',
        razorpay_subscription_id: razorpay_subscription_id,
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

    // Generate one-time conversion tracking token for Google Ads
    const conversionToken = crypto.randomUUID()
    const { error: tokenError } = await (supabase as any)
      .from('conversion_tokens')
      .insert({
        token: conversionToken,
        user_id: user.id,
        subscription_id: subscriptionData.id,
        event_type: 'mandate_setup',
        expires_at: new Date(Date.now() + 60 * 60 * 1000).toISOString(), // 1 hour expiry
      })

    if (tokenError) {
      console.error('Failed to create conversion token:', tokenError)
      // Don't fail the request if token creation fails
    }

    // Extract tier from plan_id (format: plan_RyecfdilZvSwQR)
    // We need to determine tier from the subscription notes stored during creation
    // For now, set a default tier that will be updated by webhook
    // The webhook will set the proper tier when subscription.activated event fires
    
    const isAuthentication = !razorpay_payment_id
    console.log(`Subscription ${isAuthentication ? 'authenticated' : 'payment verified'}: ${razorpay_subscription_id} for user ${user.id}`)

    return NextResponse.json({ 
      success: true,
      isAuthentication,
      message: isAuthentication ? 'Mandate authenticated successfully' : 'Payment verified successfully',
      conversionToken: isAuthentication ? conversionToken : undefined
    })
  } catch (error) {
    console.error('Subscription verification error:', error)
    return NextResponse.json(
      { error: 'Verification failed' },
      { status: 500 }
    )
  }
}
