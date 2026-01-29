import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import crypto from 'crypto'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const razorpayPaymentId = formData.get('razorpay_payment_id') as string
    const razorpaySubscriptionId = formData.get('razorpay_subscription_id') as string
    const razorpaySignature = formData.get('razorpay_signature') as string

    if (!razorpayPaymentId || !razorpaySubscriptionId || !razorpaySignature) {
      console.error('Missing required parameters in callback')
      return NextResponse.redirect(
        new URL('/pricing?error=payment_failed', request.url)
      )
    }

    // Verify signature
    const secret = process.env.RAZORPAY_KEY_SECRET
    if (!secret) {
      console.error('RAZORPAY_KEY_SECRET not configured')
      return NextResponse.redirect(
        new URL('/pricing?error=configuration_error', request.url)
      )
    }

    const generatedSignature = crypto
      .createHmac('sha256', secret)
      .update(`${razorpayPaymentId}|${razorpaySubscriptionId}`)
      .digest('hex')

    if (generatedSignature !== razorpaySignature) {
      console.error('Invalid signature')
      return NextResponse.redirect(
        new URL('/pricing?error=invalid_signature', request.url)
      )
    }

    // Get user and update subscription
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      console.error('User not authenticated')
      return NextResponse.redirect(
        new URL('/login?error=auth_required', request.url)
      )
    }

    // Fetch existing subscription to check trial eligibility
    const { data: existingSub, error: fetchError } = await supabase
      .from('subscriptions')
      .select('trial_days')
      .eq('user_id', user.id)
      .eq('razorpay_subscription_id', razorpaySubscriptionId)
      .single()

    if (fetchError) {
       console.error('Failed to fetch subscription:', fetchError)
       // Fallback: If we can't fetch, we assume trial is active if it was a new sub, 
       // but safer to not activate trial blindly for returning users.
       // However, to avoid blocking the user, we'll log it and proceed with caution.
    }

    const trialDays = existingSub?.trial_days || 0
    const isTrialActive = trialDays > 0

    // Update subscription status to authenticated
    const { error: updateError } = await supabase
      .from('subscriptions')
      .update({
        status: 'authenticated',
        razorpay_subscription_id: razorpaySubscriptionId,
        trial_active: isTrialActive, // Only activate trial if user is eligible
      })
      .eq('user_id', user.id)

    if (updateError) {
      console.error('Failed to update subscription:', updateError)
      return NextResponse.redirect(
        new URL('/pricing?error=update_failed', request.url)
      )
    }

    console.log(`Subscription authenticated: ${razorpaySubscriptionId} for user ${user.id}`)

    // Redirect to dashboard with success message
    return NextResponse.redirect(
      new URL('/dashboard?subscription=success', request.url)
    )
  } catch (error) {
    console.error('Subscription callback error:', error)
    return NextResponse.redirect(
      new URL('/pricing?error=callback_failed', request.url)
    )
  }
}
