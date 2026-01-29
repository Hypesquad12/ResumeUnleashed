import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    // Get raw body and signature
    const bodyText = await request.text()
    const signature = request.headers.get('x-razorpay-signature')

    if (!signature) {
      console.warn('Webhook received without signature')
      return NextResponse.json({ error: 'Missing signature' }, { status: 400 })
    }

    // Forward to Supabase Edge Function
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    
    if (!supabaseUrl || !supabaseAnonKey) {
      console.error('Supabase configuration missing')
      return NextResponse.json({ error: 'Configuration error' }, { status: 500 })
    }

    const response = await fetch(`${supabaseUrl}/functions/v1/razorpay-webhook`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-razorpay-signature': signature,
        'Authorization': `Bearer ${supabaseAnonKey}`,
      },
      body: bodyText,
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Edge function error:', errorText)
      return NextResponse.json(
        { error: 'Edge function processing failed' },
        { status: response.status }
      )
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Webhook proxy error:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}
