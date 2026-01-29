import { NextResponse } from 'next/server'
import Razorpay from 'razorpay'
import { createClient } from '@/lib/supabase/server'

const razorpay = new Razorpay({
  key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
})

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { subscriptionId } = await request.json()

    if (!subscriptionId) {
      return NextResponse.json(
        { error: 'Subscription ID is required' },
        { status: 400 }
      )
    }

    // Cancel the subscription in Razorpay
    // Note: This will cancel at the end of the current billing period
    // true = cancel_at_cycle_end (user keeps access until period end)
    const cancelledSubscription = await razorpay.subscriptions.cancel(subscriptionId, true)

    // Update database immediately (webhook will also update, but this prevents race conditions)
    await supabase
      .from('subscriptions')
      .update({
        cancelled_at: new Date().toISOString(),
      })
      .eq('user_id', user.id)
      .eq('razorpay_subscription_id', subscriptionId)

    return NextResponse.json({
      success: true,
      subscription: cancelledSubscription,
    })
  } catch (error: any) {
    console.error('Cancel subscription error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to cancel subscription' },
      { status: 500 }
    )
  }
}
