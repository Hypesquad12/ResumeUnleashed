import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1"
import { crypto } from "https://deno.land/std@0.177.0/crypto/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Get the signature from headers
    const signature = req.headers.get('x-razorpay-signature')
    const webhookSecret = Deno.env.get('RAZORPAY_WEBHOOK_SECRET')

    if (!signature || !webhookSecret) {
      console.error('Missing signature or secret')
      return new Response(
        JSON.stringify({ error: 'Configuration or missing signature' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get the raw body as text for verification
    const bodyText = await req.text()

    // Verify Signature
    // HMAC SHA256 hex digest
    const encoder = new TextEncoder()
    const keyData = encoder.encode(webhookSecret)
    const key = await crypto.subtle.importKey(
      "raw",
      keyData,
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign", "verify"]
    )
    const data = encoder.encode(bodyText)
    const signatureBuffer = await crypto.subtle.sign(
      "HMAC",
      key,
      data
    )
    
    const signatureArray = Array.from(new Uint8Array(signatureBuffer))
    const calculatedSignature = signatureArray.map(b => b.toString(16).padStart(2, '0')).join('')

    if (calculatedSignature !== signature) {
      console.error('Invalid signature')
      return new Response(
        JSON.stringify({ error: 'Invalid signature' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Parse the body now that it's verified
    const event = JSON.parse(bodyText)
    console.log('Processing Razorpay event:', event.event)

    // Initialize Supabase Admin Client
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Idempotency check - prevent duplicate processing
    const eventId = event.id || `${event.event}_${event.payload?.subscription?.entity?.id}_${Date.now()}`
    const { data: existingEvent } = await supabase
      .from('webhook_events')
      .select('id')
      .eq('razorpay_event_id', eventId)
      .single()

    if (existingEvent) {
      console.log('Event already processed:', eventId)
      return new Response(
        JSON.stringify({ received: true, message: 'Event already processed' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Handle Events
    switch (event.event) {
      case 'subscription.authenticated': {
        const subscription = event.payload.subscription.entity
        const userId = subscription.notes?.user_id
        if (!userId) break

        const trialDays = parseInt(subscription.notes?.trial_days || '0')
        
        await supabase
          .from('subscriptions')
          .update({
            status: 'authenticated',
            razorpay_subscription_id: subscription.id,
            razorpay_customer_id: subscription.customer_id,
            trial_active: trialDays > 0,
          })
          .eq('user_id', userId)
        
        console.log(`Updated authenticated status for user ${userId}`)
        break
      }

      case 'subscription.activated': {
        const subscription = event.payload.subscription.entity
        const userId = subscription.notes?.user_id
        if (!userId) break

        // Don't change trial_active here - trial remains active until first invoice is paid
        // subscription.activated fires when billing cycle starts, but trial may still be active
        await supabase
          .from('subscriptions')
          .update({
            status: 'active',
            razorpay_subscription_id: subscription.id,
            current_period_start: subscription.current_start ? new Date(subscription.current_start * 1000).toISOString() : null,
            current_period_end: subscription.current_end ? new Date(subscription.current_end * 1000).toISOString() : null,
          })
          .eq('user_id', userId)

        console.log(`Activated subscription for user ${userId}`)
        break
      }

      case 'invoice.paid': {
        const invoice = event.payload.invoice.entity
        const subscription = event.payload.subscription.entity
        const userId = subscription.notes?.user_id
        if (!userId) break

        // First invoice paid means trial ended and subscription is now active
        await supabase
          .from('subscriptions')
          .update({
            status: 'active',
            trial_active: false,
            next_billing_at: subscription.current_end ? new Date(subscription.current_end * 1000).toISOString() : null,
          })
          .eq('user_id', userId)

        console.log(`Invoice paid - subscription active for user ${userId}`)
        break
      }

      case 'invoice.payment_failed': {
        const invoice = event.payload.invoice.entity
        const subscription = event.payload.subscription.entity
        const userId = subscription.notes?.user_id
        if (!userId) break

        // Payment failed - set to pending, Razorpay will retry
        await supabase
          .from('subscriptions')
          .update({ status: 'pending' })
          .eq('user_id', userId)

        console.log(`Invoice payment failed - subscription pending for user ${userId}`)
        // TODO: Send email notification to user to update payment method
        break
      }

      case 'subscription.halted': {
        const subscription = event.payload.subscription.entity
        const userId = subscription.notes?.user_id
        if (!userId) break

        // All payment retries exhausted - subscription halted
        await supabase
          .from('subscriptions')
          .update({ status: 'halted' })
          .eq('user_id', userId)

        console.log(`Subscription halted for user ${userId} - payment retries exhausted`)
        // TODO: Send urgent email notification
        break
      }

      case 'subscription.charged': {
        const payment = event.payload.payment.entity
        const subscription = event.payload.subscription.entity
        const userId = subscription.notes?.user_id
        if (!userId) break

        // Get DB subscription ID
        const { data: dbSub } = await supabase
          .from('subscriptions')
          .select('id')
          .eq('user_id', userId)
          .single()

        await supabase.from('payment_transactions').insert({
          user_id: userId,
          subscription_id: dbSub?.id,
          razorpay_payment_id: payment.id,
          razorpay_order_id: payment.order_id,
          amount: payment.amount / 100,
          currency: payment.currency,
          status: 'captured',
          payment_method: payment.method,
          metadata: {
            subscription_id: subscription.id,
            event: event.event,
          },
        })
        console.log(`Recorded payment for user ${userId}`)
        break
      }

      case 'subscription.cancelled': {
        const subscription = event.payload.subscription.entity
        const userId = subscription.notes?.user_id
        if (!userId) break

        await supabase
          .from('subscriptions')
          .update({
            status: 'cancelled',
            cancelled_at: new Date().toISOString(),
          })
          .eq('user_id', userId)
        console.log(`Cancelled subscription for user ${userId}`)
        break
      }

      case 'subscription.completed':
      case 'subscription.expired': {
        const subscription = event.payload.subscription.entity
        const userId = subscription.notes?.user_id
        if (!userId) break

        await supabase
          .from('subscriptions')
          .update({ status: 'expired' })
          .eq('user_id', userId)
        break
      }

      case 'subscription.paused': {
        const subscription = event.payload.subscription.entity
        const userId = subscription.notes?.user_id
        if (!userId) break

        await supabase
          .from('subscriptions')
          .update({ status: 'paused' })
          .eq('user_id', userId)
        break
      }

      case 'payment.failed': {
        const payment = event.payload.payment.entity
        const userId = payment.notes?.user_id
        
        if (userId) {
          await supabase.from('payment_transactions').insert({
            user_id: userId,
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
        }
        break
      }
    }

    // Record event as processed for idempotency
    await supabase.from('webhook_events').insert({
      razorpay_event_id: eventId,
      event_type: event.event,
      payload: event,
    })

    return new Response(
      JSON.stringify({ received: true }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Edge Function Error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal Server Error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
