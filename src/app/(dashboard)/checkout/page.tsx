'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Loader2, CheckCircle2, XCircle, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

type PaymentStatus = 'loading' | 'success' | 'failed' | 'cancelled'

export default function CheckoutPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [status, setStatus] = useState<PaymentStatus>('loading')
  const [message, setMessage] = useState('')
  const [subscriptionDetails, setSubscriptionDetails] = useState<any>(null)

  useEffect(() => {
    const checkPaymentStatus = async () => {
      const paymentId = searchParams.get('razorpay_payment_id')
      const subscriptionId = searchParams.get('razorpay_subscription_id')
      const paymentStatus = searchParams.get('status')

      // If cancelled
      if (paymentStatus === 'cancelled') {
        setStatus('cancelled')
        setMessage('Payment was cancelled. You can try again from the pricing page.')
        return
      }

      // If payment failed
      if (paymentStatus === 'failed') {
        setStatus('failed')
        setMessage('Payment failed. Please try again or contact support.')
        return
      }

      // If we have payment details, verify with backend
      if (paymentId && subscriptionId) {
        try {
          const supabase = createClient()
          const { data: { user } } = await supabase.auth.getUser()

          if (!user) {
            router.push('/login')
            return
          }

          // Fetch subscription details
          const { data: subscription, error } = await supabase
            .from('subscriptions')
            .select('*')
            .eq('razorpay_subscription_id', subscriptionId)
            .eq('user_id', user.id)
            .single()

          if (error || !subscription) {
            setStatus('failed')
            setMessage('Could not verify subscription. Please contact support.')
            return
          }

          setSubscriptionDetails(subscription)

          if (subscription.status === 'active') {
            setStatus('success')
            setMessage('Your subscription is now active! Welcome to Resume Unleashed.')
          } else {
            setStatus('loading')
            setMessage('Processing your payment... This may take a few moments.')
            
            // Poll for status update
            setTimeout(() => checkPaymentStatus(), 3000)
          }
        } catch (error) {
          console.error('Checkout error:', error)
          setStatus('failed')
          setMessage('An error occurred. Please contact support.')
        }
      } else {
        // No payment details, might be initial load
        setStatus('loading')
        setMessage('Initializing checkout...')
      }
    }

    checkPaymentStatus()
  }, [searchParams, router])

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4">
            {status === 'loading' && (
              <Loader2 className="h-16 w-16 text-violet-600 animate-spin" />
            )}
            {status === 'success' && (
              <CheckCircle2 className="h-16 w-16 text-green-600" />
            )}
            {(status === 'failed' || status === 'cancelled') && (
              <XCircle className="h-16 w-16 text-red-600" />
            )}
          </div>
          <CardTitle className="text-2xl">
            {status === 'loading' && 'Processing Payment'}
            {status === 'success' && 'Payment Successful!'}
            {status === 'failed' && 'Payment Failed'}
            {status === 'cancelled' && 'Payment Cancelled'}
          </CardTitle>
          <CardDescription>{message}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {subscriptionDetails && status === 'success' && (
            <div className="bg-slate-50 rounded-lg p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">Plan:</span>
                <span className="font-semibold">{subscriptionDetails.plan_id}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">Billing:</span>
                <span className="font-semibold capitalize">{subscriptionDetails.billing_cycle}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">Status:</span>
                <span className="font-semibold text-green-600 capitalize">{subscriptionDetails.status}</span>
              </div>
            </div>
          )}

          <div className="flex flex-col gap-2">
            {status === 'success' && (
              <Button 
                onClick={() => router.push('/dashboard')}
                className="w-full"
              >
                Go to Dashboard
              </Button>
            )}
            
            {(status === 'failed' || status === 'cancelled') && (
              <>
                <Button 
                  onClick={() => router.push('/pricing')}
                  className="w-full"
                >
                  Try Again
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => router.push('/contact')}
                  className="w-full"
                >
                  Contact Support
                </Button>
              </>
            )}

            {status === 'loading' && (
              <Button 
                variant="outline"
                onClick={() => router.push('/pricing')}
                className="w-full"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Pricing
              </Button>
            )}
          </div>

          {status !== 'loading' && (
            <div className="text-center">
              <Link 
                href="/dashboard" 
                className="text-sm text-violet-600 hover:text-violet-700 transition-colors"
              >
                Return to Dashboard
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
