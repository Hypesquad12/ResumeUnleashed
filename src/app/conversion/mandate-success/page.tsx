'use client'

import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { CheckCircle, Zap } from 'lucide-react'

// Extend Window interface for tracking scripts
declare global {
  interface Window {
    gtag?: (...args: any[]) => void
    fbq?: (...args: any[]) => void
  }
}

export default function MandateSuccessPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const type = searchParams.get('type') || 'mandate' // 'mandate' or 'payment'

  const isMandateSetup = type === 'mandate'
  const isPaymentComplete = type === 'payment'

  useEffect(() => {
    // Track Google Ads conversion for mandate setup
    if (isMandateSetup && typeof window !== 'undefined') {
      // Google Ads Conversion Tracking
      // TODO: Replace 'MANDATE_SETUP_LABEL' with actual conversion label from Google Ads
      // Get label from: Google Ads > Tools & Settings > Conversions > Create/Select "Mandate Setup" action
      if (typeof window.gtag === 'function') {
        window.gtag('event', 'conversion', {
          'send_to': 'AW-17885779962/MANDATE_SETUP_LABEL',
          'transaction_id': ''
        })
        console.log('[CONVERSION] Mandate setup conversion tracked')
      }

      // Optional: Facebook Pixel tracking for mandate setup
      if (typeof window.fbq === 'function') {
        window.fbq('track', 'Subscribe', {
          value: 0,
          currency: 'INR'
        })
      }
    }

    // Payment conversion tracking removed - only tracking mandate setup

    // Redirect to dashboard after 3 seconds
    const timer = setTimeout(() => {
      router.push('/dashboard')
    }, 3000)

    return () => clearTimeout(timer)
  }, [router, isMandateSetup, isPaymentComplete, searchParams])

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 to-purple-50 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center p-4">
      <Card className="max-w-md w-full shadow-xl">
        <CardContent className="p-8">
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center shadow-lg animate-bounce-once">
              {isPaymentComplete ? (
                <Zap className="h-12 w-12 text-white" />
              ) : (
                <CheckCircle className="h-12 w-12 text-white" />
              )}
            </div>
            
            <div className="space-y-3">
              <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-200">
                {isPaymentComplete ? '🎉 Payment Successful!' : '✓ Setup Complete!'}
              </h1>
              
              <div className="space-y-2">
                <p className="text-lg text-slate-700 dark:text-slate-300 font-medium">
                  {isPaymentComplete 
                    ? 'Your subscription is now fully active!'
                    : 'Your payment mandate has been set up successfully!'
                  }
                </p>
                
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  {isPaymentComplete 
                    ? 'You now have unlimited access to all premium features.'
                    : 'Enjoy your 7-day trial with limited features. Your first payment will be processed automatically after the trial ends.'
                  }
                </p>
              </div>
              
              <div className="pt-4 pb-2">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-violet-100 dark:bg-violet-900/30 rounded-full">
                  <span className="text-sm font-medium text-violet-700 dark:text-violet-300">
                    Redirecting to dashboard
                  </span>
                  <div className="flex gap-1">
                    <span className="w-1.5 h-1.5 bg-violet-600 rounded-full animate-pulse" />
                    <span className="w-1.5 h-1.5 bg-violet-600 rounded-full animate-pulse delay-75" />
                    <span className="w-1.5 h-1.5 bg-violet-600 rounded-full animate-pulse delay-150" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
