import { NextRequest, NextResponse } from 'next/server'
import { verifyWebhookSignature } from '@/lib/razorpay'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    // Get raw body for signature verification
    const body = await request.text()
    const signature = request.headers.get('x-razorpay-signature')

    // Only verify signature if webhook secret is configured
    if (signature && process.env.RAZORPAY_WEBHOOK_SECRET) {
      const isValid = verifyWebhookSignature(body, signature)
      if (!isValid) {
        console.error('Invalid webhook signature')
        return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
      }
    } else if (!signature) {
      console.warn('Webhook received without signature - proceeding without verification')
    }

    const event = JSON.parse(body)
    const supabase = await createClient()

    console.log('Razorpay webhook event:', event.event)

    switch (event.event) {
      case 'subscription.authenticated': {
        const subscription = event.payload.subscription.entity
        const userId = subscription.notes?.user_id

        if (!userId) {
          console.error('Missing user_id in subscription notes')
          break
        }

        // Get trial_days from subscription notes
        const trialDays = parseInt(subscription.notes?.trial_days || '0')

        // Update subscription status to authenticated (mandate verified, trial active)
        await supabase
          .from('subscriptions')
          .update({
            status: 'authenticated',
            razorpay_subscription_id: subscription.id,
            razorpay_customer_id: subscription.customer_id,
            trial_active: trialDays > 0,
          })
          .eq('user_id', userId)

        console.log(`Subscription authenticated for user ${userId}, trial: ${trialDays} days`)
        break
      }

      case 'subscription.activated': {
        const subscription = event.payload.subscription.entity
        const userId = subscription.notes?.user_id

        if (!userId) {
          console.error('Missing user_id in subscription notes')
          break
        }

        // Update subscription status to active (payment completed, trial ended)
        await supabase
          .from('subscriptions')
          .update({
            status: 'active',
            razorpay_subscription_id: subscription.id,
            trial_active: false,
          })
          .eq('user_id', userId)

        console.log(`Subscription activated for user ${userId}`)
        break
      }

      case 'subscription.charged': {
        const payment = event.payload.payment.entity
        const subscription = event.payload.subscription.entity
        const userId = subscription.notes?.user_id

        if (!userId) {
          console.error('Missing user_id in subscription notes')
          break
        }

        // Get subscription from database
        const { data: dbSubscription } = await supabase
          .from('subscriptions')
          .select('id')
          .eq('user_id', userId)
          .single()

        // Record payment transaction
        await supabase.from('payment_transactions').insert({
          user_id: userId,
          subscription_id: dbSubscription?.id,
          razorpay_payment_id: payment.id,
          razorpay_order_id: payment.order_id,
          amount: payment.amount / 100, // Convert paise to rupees
          currency: payment.currency,
          status: 'captured',
          payment_method: payment.method,
          metadata: {
            subscription_id: subscription.id,
            event: event.event,
          },
        })

        console.log(`Payment recorded for user ${userId}`)
        break
      }

      case 'subscription.cancelled': {
        const subscription = event.payload.subscription.entity
        const userId = subscription.notes?.user_id

        if (!userId) {
          console.error('Missing user_id in subscription notes')
          break
        }

        // Update subscription status
        await supabase
          .from('subscriptions')
          .update({
            status: 'cancelled',
            cancelled_at: new Date().toISOString(),
          })
          .eq('user_id', userId)

        console.log(`Subscription cancelled for user ${userId}`)
        break
      }

      case 'subscription.completed':
      case 'subscription.expired': {
        const subscription = event.payload.subscription.entity
        const userId = subscription.notes?.user_id

        if (!userId) {
          console.error('Missing user_id in subscription notes')
          break
        }

        // Update subscription status
        await supabase
          .from('subscriptions')
          .update({
            status: 'expired',
          })
          .eq('user_id', userId)

        console.log(`Subscription expired for user ${userId}`)
        break
      }

      case 'subscription.paused': {
        const subscription = event.payload.subscription.entity
        const userId = subscription.notes?.user_id

        if (!userId) {
          console.error('Missing user_id in subscription notes')
          break
        }

        // Update subscription status
        await supabase
          .from('subscriptions')
          .update({
            status: 'paused',
          })
          .eq('user_id', userId)

        console.log(`Subscription paused for user ${userId}`)
        break
      }

      case 'payment.failed': {
        const payment = event.payload.payment.entity
        
        // Record failed payment
        await supabase.from('payment_transactions').insert({
          user_id: payment.notes?.user_id,
          razorpay_payment_id: payment.id,
          razorpay_order_id: payment.order_id,
          amount: payment.amount / 100,
          currency: payment.currency,
          status: 'failed',
          payment_method: payment.method,
          metadata: {
            error_code: payment.error_code,
            error_description: payment.error_description,
            event: event.event,
          },
        })

        console.log(`Payment failed: ${payment.id}`)
        break
      }

      default:
        console.log(`Unhandled webhook event: ${event.event}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook processing error:', error)
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    )
  }
}
