import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const redirect = searchParams.get('redirect')
  const planId = searchParams.get('plan')
  const cycle = searchParams.get('cycle')

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error) {
      // If user was signing up for a plan, redirect back to pricing
      if (redirect === 'pricing' && planId && cycle) {
        return NextResponse.redirect(`${origin}/pricing?plan=${planId}&cycle=${cycle}&autoselect=true`)
      }
      
      // Default redirect to dashboard
      return NextResponse.redirect(`${origin}${redirect || '/dashboard'}`)
    }
  }

  // Return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/login?error=auth_callback_error`)
}
