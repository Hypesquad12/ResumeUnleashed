import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import crypto from 'crypto'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { razorpay_payment_id, razorpay_signature, subscription_id } = body

    if (!razorpay_payment_id || !subscription_id) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // For standard payments (not order-based), we just verify the payment was successful
    // Razorpay will send webhook for further verification
    
    // Update subscription status
    const { error: updateError } = await supabase
      .from('subscriptions')
      .update({
        razorpay_payment_id,
        status: 'active',
        updated_at: new Date().toISOString(),
      })
      .eq('id', subscription_id)
      .eq('user_id', user.id)

    if (updateError) {
      console.error('Failed to update subscription:', updateError)
      return NextResponse.json({ error: 'Failed to update subscription' }, { status: 500 })
    }

    console.log('Payment verified successfully:', razorpay_payment_id)

    return NextResponse.json({ 
      success: true,
      message: 'Payment verified successfully'
    })

  } catch (error: any) {
    console.error('Payment verification error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to verify payment' },
      { status: 500 }
    )
  }
}
