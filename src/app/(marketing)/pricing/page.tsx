'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { PricingCard } from '@/components/pricing/pricing-card'
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
  const [billingCycle, setBillingCycle] = useState<BillingCycle>('monthly')
  const [isDetecting, setIsDetecting] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  const [user, setUser] = useState<any>(null)

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
    // Skip free plan
    if (plan.tier === 'free') {
      if (!user) {
        router.push('/signup')
      } else {
        router.push('/dashboard')
      }
      return
    }

    // Check if user is authenticated
    if (!user) {
      // Store plan selection and redirect to signup
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('selectedPlan', JSON.stringify({ planId: plan.id, cycle }))
      }
      router.push(`/signup?redirect=pricing&plan=${plan.id}&cycle=${cycle}`)
      return
    }

    setIsLoading(true)

    try {
      // Create subscription
      const response = await fetch('/api/razorpay/create-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          planId: plan.id,
          billingCycle: cycle,
          region: plan.region,
          tier: plan.tier,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        console.error('API Error:', error)
        throw new Error(error.error || 'Failed to create subscription')
      }

      const data = await response.json()
      console.log('API Response:', data)
      console.log('Short URL:', data.shortUrl)

      // Redirect to Razorpay payment page
      if (data.shortUrl) {
        console.log('Redirecting to:', data.shortUrl)
        window.location.href = data.shortUrl
      } else {
        console.error('No shortUrl in response:', data)
        throw new Error('No payment URL received')
      }
    } catch (error: any) {
      console.error('Subscription error:', error)
      const errorMessage = error.message || 'Failed to create subscription. Please try again.'
      
      // Show user-friendly error
      if (typeof window !== 'undefined') {
        alert(errorMessage)
      }
    } finally {
      setIsLoading(false)
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
          <p className="text-muted-foreground">Detecting your location...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
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
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
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
