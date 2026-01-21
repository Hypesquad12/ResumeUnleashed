import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const token = searchParams.get('token')

    if (!token) {
      return NextResponse.json(
        { error: 'Token is required' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Validate token - check if unused and not expired
    const { data: tokenData, error: tokenError } = await (supabase as any)
      .from('conversion_tokens')
      .select('*')
      .eq('token', token)
      .is('used_at', null)
      .gt('expires_at', new Date().toISOString())
      .single()

    if (tokenError || !tokenData) {
      // Return HTML with no conversion (token invalid/expired/used)
      return new NextResponse(
        `<!DOCTYPE html>
<html>
<head>
  <title>Conversion Tracking</title>
</head>
<body>
  <script>
    // Token invalid - no conversion tracking
    window.location.href = '/settings';
  </script>
</body>
</html>`,
        {
          headers: { 'Content-Type': 'text/html' },
        }
      )
    }

    // Mark token as used
    await (supabase as any)
      .from('conversion_tokens')
      .update({ used_at: new Date().toISOString() })
      .eq('id', tokenData.id)

    // Return HTML with Google Ads conversion tracking
    return new NextResponse(
      `<!DOCTYPE html>
<html>
<head>
  <title>Subscription Successful</title>
  <!-- Google Ads Conversion Tracking -->
  <script>
    gtag('event', 'conversion', {
      'send_to': 'AW-CONVERSION_ID/CONVERSION_LABEL',
      'value': 1.0,
      'currency': 'INR',
      'transaction_id': '${tokenData.subscription_id || ''}'
    });
    
    // Redirect to settings after tracking
    setTimeout(function() {
      window.location.href = '/settings';
    }, 1000);
  </script>
</head>
<body>
  <div style="font-family: system-ui; max-width: 600px; margin: 100px auto; text-align: center;">
    <h1 style="color: #10b981;">✓ Subscription Activated!</h1>
    <p style="color: #64748b;">Redirecting you to your account settings...</p>
  </div>
</body>
</html>`,
      {
        headers: { 'Content-Type': 'text/html' },
      }
    )
  } catch (error) {
    console.error('Conversion tracking error:', error)
    return new NextResponse(
      `<!DOCTYPE html>
<html>
<head>
  <title>Error</title>
</head>
<body>
  <script>
    window.location.href = '/settings';
  </script>
</body>
</html>`,
      {
        headers: { 'Content-Type': 'text/html' },
      }
    )
  }
}
