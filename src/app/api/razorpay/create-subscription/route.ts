import { NextRequest, NextResponse } from 'next/server'
import { getRazorpayInstance, RAZORPAY_PLAN_IDS } from '@/lib/razorpay'
import { createClient } from '@/lib/supabase/server'
import { Region, BillingCycle, SubscriptionTier } from '@/lib/pricing-config'

// Razorpay subscription response type
interface RazorpaySubscriptionResponse {
  id: string
  short_url: string
  status: string
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { planId, billingCycle, region, tier } = body as {
      planId: string
      billingCycle: BillingCycle
      region: Region
      tier: SubscriptionTier
    }

    // Validate input
    if (!planId || !billingCycle || !region || !tier) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Get Razorpay plan ID
    const razorpayPlanKey = `${tier}_${billingCycle}` as keyof typeof RAZORPAY_PLAN_IDS.india
    const razorpayPlanId = RAZORPAY_PLAN_IDS[region][razorpayPlanKey]

    console.log('Subscription request:', { planId, billingCycle, region, tier })
    console.log('Razorpay plan key:', razorpayPlanKey)
    console.log('Razorpay plan ID:', razorpayPlanId)

    if (!razorpayPlanId || razorpayPlanId === 'plan_xxxxx') {
      console.error('Razorpay plan not found:', { region, tier, billingCycle })
      return NextResponse.json(
        { error: 'Razorpay plan not configured. Please set up plans in Razorpay Dashboard first.' },
        { status: 500 }
      )
    }

    const razorpay = getRazorpayInstance()

    // Create subscription using Razorpay API
    // IMPORTANT: Do NOT pass customer_id - it breaks hosted checkout link generation
    // Razorpay will create customer automatically during payment authentication
    // Set start_at to future time to prevent auto-charge before authentication
    const futureStart = Math.floor(Date.now() / 1000) + (24 * 60 * 60) // Start 24 hours from now
    
    const subscriptionParams = {
      plan_id: razorpayPlanId,
      total_count: billingCycle === 'annual' ? 1 : 12,
      quantity: 1,
      customer_notify: 1,
      start_at: futureStart, // Required for hosted authentication
      addons: [], // Explicitly set empty addons
      notes: {
        user_id: user.id,
        user_email: user.email || '',
        plan_id: planId,
        region,
        tier,
        billing_cycle: billingCycle,
      },
    }

    console.log('Creating Razorpay subscription with params:', subscriptionParams)

    const subscription = await razorpay.subscriptions.create(
      subscriptionParams as any
    ) as unknown as RazorpaySubscriptionResponse

    console.log('Razorpay subscription created:', subscription.id)
    console.log('Razorpay subscription response:', JSON.stringify(subscription, null, 2))

    // Store subscription in database (pending status until payment)
    const periodStart = new Date()
    const periodEnd = new Date()
    if (billingCycle === 'annual') {
      periodEnd.setFullYear(periodEnd.getFullYear() + 1)
    } else {
      periodEnd.setMonth(periodEnd.getMonth() + 1)
    }

    const { error: dbError } = await supabase
      .from('subscriptions')
      .upsert({
        user_id: user.id,
        plan_id: razorpayPlanId, // Use Razorpay plan ID, not frontend plan ID
        razorpay_subscription_id: subscription.id,
        razorpay_customer_id: null, // Will be updated by webhook after authentication
        status: 'pending',
        billing_cycle: billingCycle,
        current_period_start: periodStart.toISOString(),
        current_period_end: periodEnd.toISOString(),
      }, {
        onConflict: 'user_id' // Specify which column to use for upsert conflict resolution
      })

    if (dbError) {
      console.error('Database error:', dbError)
      return NextResponse.json({ error: 'Failed to save subscription' }, { status: 500 })
    }

    console.log('Returning response:', {
      subscriptionId: subscription.id,
      shortUrl: subscription.short_url,
    })

    return NextResponse.json({
      subscriptionId: subscription.id,
      shortUrl: subscription.short_url,
    })
  } catch (error: any) {
    console.error('Subscription creation error:', error)
    console.error('Error details:', {
      message: error.message,
      description: error.description,
      statusCode: error.statusCode,
      error: error.error,
    })
    
    // Return more detailed error message
    const errorMessage = error.description || error.message || 'Failed to create subscription'
    return NextResponse.json(
      { error: errorMessage, details: error.error },
      { status: 500 }
    )
  }
}
