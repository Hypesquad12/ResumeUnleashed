'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Loader2, Tag, Check, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
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
  const [couponCode, setCouponCode] = useState('')
  const [validatingCoupon, setValidatingCoupon] = useState(false)
  const [couponData, setCouponData] = useState<any>(null)
  const [couponError, setCouponError] = useState('')

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

  const validateCoupon = async (plan: PricingPlan, cycle: BillingCycle) => {
    if (!couponCode.trim()) {
      setCouponData(null)
      setCouponError('')
      return
    }

    setValidatingCoupon(true)
    setCouponError('')

    try {
      const planAmount = cycle === 'monthly' ? plan.priceMonthly : plan.priceAnnual
      
      const response = await fetch('/api/razorpay/validate-coupon', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ couponCode, planAmount }),
      })

      const data = await response.json()

      if (data.valid) {
        setCouponData(data)
        setCouponError('')
      } else {
        setCouponData(null)
        setCouponError(data.error || 'Invalid coupon code')
      }
    } catch (error) {
      setCouponData(null)
      setCouponError('Failed to validate coupon')
    } finally {
      setValidatingCoupon(false)
    }
  }

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
      // Create Razorpay order for UPI AutoPay with immediate payment
      const response = await fetch('/api/razorpay/create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          planId: plan.id,
          billingCycle: cycle,
          region: plan.region,
          tier: plan.tier,
          couponCode: couponData?.couponCode || null,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        console.error('API Error:', error)
        throw new Error(error.error || 'Failed to create order')
      }

      const data = await response.json()
      console.log('Order created:', data)

      // Initialize Razorpay Checkout
      const options = {
        key: data.keyId,
        amount: data.amount * 100, // Amount in paise
        currency: data.currency,
        name: 'Resume Unleashed',
        description: `${plan.name} - ${cycle === 'monthly' ? 'Monthly' : 'Annual'}`,
        order_id: data.orderId,
        prefill: {
          name: data.userName,
          email: data.userEmail,
          contact: data.userPhone || '',
        },
        notes: {
          plan_tier: plan.tier,
          billing_cycle: cycle,
        },
        theme: {
          color: '#8b5cf6', // violet-500
        },
        handler: function (response: any) {
          console.log('Payment successful:', response)
          // Redirect to dashboard after successful payment
          window.location.href = '/dashboard?payment=success'
        },
        modal: {
          ondismiss: function() {
            setIsLoading(false)
            console.log('Payment cancelled by user')
          }
        },
        recurring: 1, // Enable UPI AutoPay/Recurring
      }

      const rzp = new (window as any).Razorpay(options)
      rzp.open()
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

          {/* Promo Code Section */}
          <div className="mt-8 max-w-md mx-auto">
            <Card className="p-4 border-violet-200 bg-violet-50/50">
              <div className="flex items-center gap-2 mb-3">
                <Tag className="h-4 w-4 text-violet-600" />
                <Label className="text-sm font-semibold text-violet-900">Have a promo code?</Label>
              </div>
              <div className="flex gap-2">
                <div className="flex-1 relative">
                  <Input
                    type="text"
                    placeholder="Enter code"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    className="pr-8"
                    disabled={validatingCoupon}
                  />
                  {couponData && (
                    <Check className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-green-600" />
                  )}
                  {couponError && (
                    <X className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-red-600" />
                  )}
                </div>
                <Button
                  variant="outline"
                  onClick={() => {
                    const selectedPlan = plans.find(p => p.tier !== 'free')
                    if (selectedPlan) validateCoupon(selectedPlan, billingCycle)
                  }}
                  disabled={!couponCode.trim() || validatingCoupon}
                  className="border-violet-300 hover:bg-violet-100"
                >
                  {validatingCoupon ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Apply'}
                </Button>
              </div>
              {couponData && (
                <div className="mt-2 text-sm text-green-700 font-medium">
                  ✓ {couponData.discountType === 'percentage' 
                    ? `${couponData.discount}% off` 
                    : `₹${couponData.discountAmount} off`} applied!
                </div>
              )}
              {couponError && (
                <div className="mt-2 text-sm text-red-600">
                  {couponError}
                </div>
              )}
            </Card>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto mt-12">
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
