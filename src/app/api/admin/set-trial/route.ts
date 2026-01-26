import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    const supabase = await createClient()

    // Update user's trial status
    const { data, error } = await supabase
      .from('profiles')
      .update({
        trial_active: true,
        trial_ends_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days from now
      })
      .eq('email', email)
      .select()

    if (error) {
      console.error('Error updating trial:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    if (!data || data.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    return NextResponse.json({ 
      success: true, 
      message: `Trial activated for ${email}`,
      data: data[0]
    })
  } catch (error: any) {
    console.error('Error in set-trial API:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
