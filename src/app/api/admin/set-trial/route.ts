import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    const supabase = await createClient()

    // First, get the user ID from profiles
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', email)
      .single()

    if (profileError || !profile) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Check if subscription exists
    const { data: existingSub } = await supabase
      .from('subscriptions')
      .select('id')
      .eq('user_id', profile.id)
      .single()

    if (existingSub) {
      // Update existing subscription
      const { data, error } = await supabase
        .from('subscriptions')
        .update({
          trial_active: true,
          current_period_end: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
        })
        .eq('user_id', profile.id)
        .select()
        .single()

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
      }

      return NextResponse.json({ 
        success: true, 
        message: `Trial activated for ${email}`,
        data
      })
    } else {
      // Create new subscription
      const { data, error } = await supabase
        .from('subscriptions')
        .insert({
          user_id: profile.id,
          status: 'active',
          billing_cycle: 'monthly',
          tier: 'professional',
          region: 'india',
          plan_id: 'india-professional',
          trial_active: true,
          current_period_start: new Date().toISOString(),
          current_period_end: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
        })
        .select()
        .single()

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
      }

      return NextResponse.json({ 
        success: true, 
        message: `Trial created for ${email}`,
        data
      })
    }
  } catch (error: any) {
    console.error('Error in set-trial API:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
