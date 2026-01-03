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

    // Get or create Razorpay customer
    let customerId: string | undefined

    // Check if user already has a Razorpay customer ID
    const { data: existingSubscription } = await supabase
      .from('subscriptions')
      .select('razorpay_customer_id')
      .eq('user_id', user.id)
      .maybeSingle() // Use maybeSingle() instead of single() to handle no results gracefully

    if (existingSubscription?.razorpay_customer_id) {
      customerId = existingSubscription.razorpay_customer_id
    } else {
      // Create new customer
      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name, email, phone')
        .eq('id', user.id)
        .single()

      try {
        const customer = (await razorpay.customers.create({
          name: profile?.full_name || user.email?.split('@')[0] || 'User',
          email: user.email || '',
          contact: profile?.phone || '', // Add phone number for hosted checkout
          fail_existing: 0,
        })) as any

        customerId = customer.id
      } catch (customerError: any) {
        // If customer already exists, fetch existing customer by email
        if (customerError.error?.code === 'BAD_REQUEST_ERROR') {
          console.log('Customer exists, fetching existing customer...')
          const customers = (await razorpay.customers.all({})) as any
          // Find customer by email
          const existingCustomer = customers.items?.find((c: any) => c.email === user.email)
          if (existingCustomer) {
            customerId = existingCustomer.id
            console.log('Using existing customer:', customerId)
          } else {
            throw new Error('Failed to create or fetch customer')
          }
        } else {
          throw customerError
        }
      }
    }

    // Create subscription using Razorpay API
    // For hosted checkout, subscription must be in 'created' status (not authenticated)
    // Set start_at to future time to prevent auto-charge before authentication
    const futureStart = Math.floor(Date.now() / 1000) + (24 * 60 * 60) // Start 24 hours from now
    
    const subscriptionParams = {
      plan_id: razorpayPlanId,
      customer_id: customerId,
      total_count: billingCycle === 'annual' ? 1 : 12,
      quantity: 1,
      customer_notify: 1,
      start_at: futureStart, // Required for hosted authentication
      addons: [], // Explicitly set empty addons
      notes: {
        user_id: user.id,
        plan_id: planId,
        region,
        tier,
        billing_cycle: billingCycle,
      },
      notify_info: {
        notify_email: user.email || '',
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
        razorpay_customer_id: customerId,
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
      customerId,
      shortUrl: subscription.short_url,
    })

    return NextResponse.json({
      subscriptionId: subscription.id,
      customerId,
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
