'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { PricingCard } from '@/components/pricing/pricing-card'
import { CheckoutModal } from '@/components/checkout/checkout-modal'
import { 
  getPricingByRegion, 
  Region, 
  BillingCycle, 
  PricingPlan,
} from '@/lib/pricing-config'
import { 
  detectUserRegion, 
  detectRegionFromTimezone, 
  getStoredRegion, 
  storeRegion 
} from '@/lib/geo-detection'
import { createClient } from '@/lib/supabase/client'

function PricingPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [region, setRegion] = useState<Region>('row')
  const [billingCycle, setBillingCycle] = useState<BillingCycle>('annual')
  const [isDetecting, setIsDetecting] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [showCheckoutModal, setShowCheckoutModal] = useState(false)
  const [selectedPlanForCheckout, setSelectedPlanForCheckout] = useState<PricingPlan | null>(null)
  const [selectedCycleForCheckout, setSelectedCycleForCheckout] = useState<BillingCycle>('monthly')

  const plans = getPricingByRegion(region)
  
  // Check if user just signed up and should auto-select a plan
  const autoSelectPlanId = searchParams.get('plan')
  const autoSelectCycle = searchParams.get('cycle') as BillingCycle | null
  const shouldAutoSelect = searchParams.get('autoselect') === 'true'

  // Detect user region on mount
  useEffect(() => {
    async function detectRegion() {
      // Check stored preference first
      const stored = getStoredRegion()
      if (stored) {
        setRegion(stored)
        setIsDetecting(false)
        return
      }

      // Try IP-based detection
      try {
        const detected = await detectUserRegion()
        setRegion(detected)
        // Don't store auto-detected region
      } catch (error) {
        // Fallback to timezone detection
        const fallback = detectRegionFromTimezone()
        setRegion(fallback)
        // Don't store auto-detected region
      } finally {
        setIsDetecting(false)
      }
    }

    detectRegion()
  }, [])

  // Check authentication
  useEffect(() => {
    async function checkAuth() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      
      // Auto-select plan after signup
      if (user && shouldAutoSelect && autoSelectPlanId && autoSelectCycle) {
        const selectedPlan = plans.find(p => p.id === autoSelectPlanId)
        if (selectedPlan) {
          // Set billing cycle
          setBillingCycle(autoSelectCycle)
          // Trigger plan selection after a short delay
          setTimeout(() => {
            handlePlanSelect(selectedPlan, autoSelectCycle)
          }, 1000)
        }
      }
    }
    checkAuth()
  }, [shouldAutoSelect, autoSelectPlanId, autoSelectCycle, plans])

  const handlePlanSelect = async (plan: PricingPlan, cycle: BillingCycle) => {
    // Check if user is authenticated
    if (!user) {
      // Store plan selection and redirect to signup
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('selectedPlan', JSON.stringify({ planId: plan.id, cycle }))
      }
      router.push(`/signup?redirect=pricing&plan=${plan.id}&cycle=${cycle}`)
      return
    }

    // Open checkout modal with selected plan
    setSelectedPlanForCheckout(plan)
    setSelectedCycleForCheckout(cycle)
    setShowCheckoutModal(true)
  }

  const handleCheckoutProceed = async (couponCode?: string) => {
    if (!selectedPlanForCheckout || !user) return

    setIsLoading(true)

    try {
      // Create subscription via API (this handles mandate creation with trial period)
      const response = await fetch('/api/razorpay/create-subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planId: selectedPlanForCheckout.id,
          billingCycle: selectedCycleForCheckout,
          region: selectedPlanForCheckout.region,
          tier: selectedPlanForCheckout.tier,
          couponCode: couponCode || undefined,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create subscription')
      }

      const { subscriptionId } = await response.json()

      console.log('Subscription created:', subscriptionId)

      // Load Razorpay Checkout script dynamically
      const loadRazorpay = () => {
        return new Promise((resolve) => {
          const script = document.createElement('script')
          script.src = 'https://checkout.razorpay.com/v1/checkout.js'
          script.onload = () => resolve(true)
          document.body.appendChild(script)
        })
      }

      await loadRazorpay()

      // Close checkout modal before opening Razorpay to prevent modal stacking
      setShowCheckoutModal(false)

      // Open Razorpay Standard Checkout for subscription authentication
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        subscription_id: subscriptionId,
        name: 'Resume Unleashed',
        description: `${selectedPlanForCheckout.name} Plan`,
        image: '/logo.png',
        prefill: {
          name: user.user_metadata?.full_name || '',
          contact: user.user_metadata?.phone || '',
        },
        readonly: {
          contact: false,
          name: false,
        },
        handler: async (response: any) => {
          try {
            // Verify the payment/mandate signature
            const verifyResponse = await fetch('/api/razorpay/verify-subscription', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_subscription_id: response.razorpay_subscription_id,
                razorpay_signature: response.razorpay_signature,
              }),
            })

            if (verifyResponse.ok) {
              const data = await verifyResponse.json()
              setIsLoading(false)
              
              // Show success message
              if (data.isAuthentication) {
                alert('✓ Mandate authenticated successfully! Your subscription is now active.')
                
                // Redirect to conversion tracking page for Google Ads tracking
                if (data.conversionToken) {
                  router.push(`/api/conversion/track?token=${data.conversionToken}`)
                } else {
                  router.push('/settings')
                }
              } else {
                alert('✓ Payment verified successfully!')
                router.push('/settings')
              }
            } else {
              const errorData = await verifyResponse.json()
              throw new Error(errorData.error || 'Verification failed')
            }
          } catch (error) {
            console.error('Payment verification error:', error)
            const errorMessage = error instanceof Error ? error.message : 'Unknown error'
            alert(`Payment verification failed: ${errorMessage}. Please contact support if the issue persists.`)
            setIsLoading(false)
          }
        },
        theme: {
          color: '#0ea5e9',
        },
        modal: {
          ondismiss: () => {
            setIsLoading(false)
            setShowCheckoutModal(false)
          },
        },
      }

      // @ts-ignore - Razorpay is loaded dynamically
      const razorpay = new window.Razorpay(options)
      razorpay.open()
      
    } catch (error: any) {
      console.error('Subscription creation error:', error)
      const errorMessage = error.message || 'Failed to create subscription. Please try again.'
      
      if (typeof window !== 'undefined') {
        alert(errorMessage)
      }
      setIsLoading(false)
      setShowCheckoutModal(false)
    }
  }

  const toggleRegion = () => {
    const newRegion = region === 'india' ? 'row' : 'india'
    setRegion(newRegion)
    storeRegion(newRegion, true) // User manually set, so persist
  }

  if (isDetecting) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50"
      style={{
        background: 'linear-gradient(to bottom, #f8fafc 0%, #ffffff 50%, #f8fafc 100%)'
      }}
    >
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Choose Your Plan
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Get started with AI-powered resume building today
          </p>

          {/* Billing Cycle Toggle */}
          <div className="flex items-center justify-center gap-4">
            <Label htmlFor="billing-cycle" className={billingCycle === 'monthly' ? 'font-semibold' : 'text-muted-foreground'}>
              Monthly
            </Label>
            <Switch
              id="billing-cycle"
              checked={billingCycle === 'annual'}
              onCheckedChange={(checked: boolean) => setBillingCycle(checked ? 'annual' : 'monthly')}
            />
            <Label htmlFor="billing-cycle" className={billingCycle === 'annual' ? 'font-semibold' : 'text-muted-foreground'}>
              Annual
              <span className="ml-2 text-green-600 dark:text-green-400 text-sm">
                (Save up to 25%)
              </span>
            </Label>
          </div>

        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto mt-12">
          {plans.map((plan) => (
            <PricingCard
              key={plan.id}
              plan={plan}
              billingCycle={billingCycle}
              onSelect={handlePlanSelect}
              isLoading={isLoading}
            />
          ))}
        </div>

        {/* FAQ or Additional Info */}
        <div className="mt-16 text-center">
          <p className="text-sm text-muted-foreground">
            All plans include a 14-day money-back guarantee. Cancel anytime.
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            Need help choosing? <a href="/contact" className="text-primary hover:underline">Contact us</a>
          </p>
        </div>

        {/* Currency Note */}
        {region === 'row' && (
          <div className="mt-8 text-center">
            <p className="text-xs text-muted-foreground">
              * International pricing is charged in INR. USD prices are approximate based on current exchange rates.
            </p>
          </div>
        )}

        {/* Checkout Modal */}
        {selectedPlanForCheckout && (
          <CheckoutModal
            open={showCheckoutModal}
            onClose={() => {
              setShowCheckoutModal(false)
              setSelectedPlanForCheckout(null)
            }}
            plan={selectedPlanForCheckout}
            billingCycle={selectedCycleForCheckout}
            onProceed={handleCheckoutProceed}
            isLoading={isLoading}
          />
        )}
      </div>
    </div>
  )
}

export default function PricingPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-violet-600" />
      </div>
    }>
      <PricingPageContent />
    </Suspense>
  )
}
