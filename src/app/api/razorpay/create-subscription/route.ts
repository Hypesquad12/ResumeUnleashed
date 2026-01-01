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

    if (!razorpayPlanId || razorpayPlanId === 'plan_xxxxx') {
      return NextResponse.json(
        { error: 'Razorpay plan not configured. Please set up plans in Razorpay Dashboard first.' },
        { status: 500 }
      )
    }

    const razorpay = getRazorpayInstance()

    // Get or create Razorpay customer
    let customerId: string | undefined

    // Check if user already has a Razorpay customer ID
    const { data: existingSubscription } = await supabase
      .from('subscriptions')
      .select('razorpay_customer_id')
      .eq('user_id', user.id)
      .single()

    if (existingSubscription?.razorpay_customer_id) {
      customerId = existingSubscription.razorpay_customer_id
    } else {
      // Create new customer
      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name, email')
        .eq('id', user.id)
        .single()

      const customer = await razorpay.customers.create({
        name: profile?.full_name || user.email?.split('@')[0] || 'User',
        email: user.email || '',
        fail_existing: 0,
      }) as { id: string }

      customerId = customer.id
    }

    // Create subscription using Razorpay API
    const subscriptionParams = {
      plan_id: razorpayPlanId,
      customer_id: customerId,
      total_count: billingCycle === 'annual' ? 1 : 12,
      quantity: 1,
      customer_notify: 1,
      notes: {
        user_id: user.id,
        plan_id: planId,
        region,
        tier,
        billing_cycle: billingCycle,
      },
    }

    const subscription = await razorpay.subscriptions.create(
      subscriptionParams as any
    ) as unknown as RazorpaySubscriptionResponse

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
        plan_id: planId,
        razorpay_subscription_id: subscription.id,
        razorpay_customer_id: customerId,
        status: 'pending',
        billing_cycle: billingCycle,
        current_period_start: periodStart.toISOString(),
        current_period_end: periodEnd.toISOString(),
      })

    if (dbError) {
      console.error('Database error:', dbError)
      return NextResponse.json({ error: 'Failed to save subscription' }, { status: 500 })
    }

    return NextResponse.json({
      subscriptionId: subscription.id,
      customerId,
      shortUrl: subscription.short_url,
    })
  } catch (error) {
    console.error('Subscription creation error:', error)
    return NextResponse.json(
      { error: 'Failed to create subscription' },
      { status: 500 }
    )
  }
}
