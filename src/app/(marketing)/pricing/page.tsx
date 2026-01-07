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
  const [billingCycle, setBillingCycle] = useState<BillingCycle>('monthly')
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

    // Open checkout modal with selected plan
    setSelectedPlanForCheckout(plan)
    setSelectedCycleForCheckout(cycle)
    setShowCheckoutModal(true)
  }

  const handleCheckoutProceed = async (couponCode?: string) => {
    if (!selectedPlanForCheckout || !user) return

    setIsLoading(true)

    try {
      // Calculate amount
      const baseAmount = selectedCycleForCheckout === 'monthly' 
        ? selectedPlanForCheckout.priceMonthly 
        : selectedPlanForCheckout.priceAnnual

      let finalAmount = baseAmount
      let discountAmount = 0

      // Apply coupon if provided
      if (couponCode) {
        const promoCodes: Record<string, { discount: number; type: 'percentage' | 'flat'; maxDiscount?: number }> = {
          'WELCOME10': { discount: 10, type: 'percentage', maxDiscount: 100 },
          'SAVE20': { discount: 20, type: 'percentage', maxDiscount: 200 },
          'FLAT100': { discount: 100, type: 'flat' },
          'FLAT200': { discount: 200, type: 'flat' },
        }

        const promo = promoCodes[couponCode.toUpperCase()]
        if (promo) {
          if (promo.type === 'percentage') {
            discountAmount = Math.round((baseAmount * promo.discount) / 100)
            if (promo.maxDiscount && discountAmount > promo.maxDiscount) {
              discountAmount = promo.maxDiscount
            }
          } else {
            discountAmount = promo.discount
          }
          finalAmount = Math.max(0, baseAmount - discountAmount)
        }
      }

      // Convert to paise
      const amountInPaise = finalAmount * 100

      // Save subscription intent to database
      const supabase = createClient()
      const periodStart = new Date()
      const periodEnd = new Date()
      if (selectedCycleForCheckout === 'annual') {
        periodEnd.setFullYear(periodEnd.getFullYear() + 1)
      } else {
        periodEnd.setMonth(periodEnd.getMonth() + 1)
      }

      const { data: subscriptionData, error: dbError } = await supabase
        .from('subscriptions')
        .upsert({
          user_id: user.id,
          status: 'pending',
          billing_cycle: selectedCycleForCheckout,
          current_period_start: periodStart.toISOString(),
          current_period_end: periodEnd.toISOString(),
        }, {
          onConflict: 'user_id'
        })
        .select()
        .single()

      if (dbError) {
        console.error('Database error:', dbError)
        throw new Error('Failed to save subscription')
      }

      // Initialize Razorpay Checkout with UPI mandate
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: amountInPaise,
        currency: selectedPlanForCheckout.currency,
        name: 'Resume Unleashed',
        description: `${selectedPlanForCheckout.name} - ${selectedCycleForCheckout === 'monthly' ? 'Monthly' : 'Annual'}`,
        prefill: {
          name: user.email?.split('@')[0] || 'User',
          email: user.email || '',
        },
        notes: {
          user_id: user.id,
          plan_name: selectedPlanForCheckout.name,
          plan_tier: selectedPlanForCheckout.tier,
          billing_cycle: selectedCycleForCheckout,
          subscription_db_id: subscriptionData.id,
          original_amount: baseAmount.toString(),
          final_amount: finalAmount.toString(),
          ...(couponCode && {
            coupon_code: couponCode,
            discount_amount: discountAmount.toString(),
          }),
        },
        theme: {
          color: '#8b5cf6',
        },
        handler: async function (response: any) {
          console.log('Payment successful:', response)
          
          // Verify payment on backend
          const verifyResponse = await fetch('/api/razorpay/verify-payment', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              subscription_id: subscriptionData.id,
            }),
          })

          if (verifyResponse.ok) {
            window.location.href = '/dashboard?payment=success'
          } else {
            window.location.href = '/dashboard?payment=failed'
          }
        },
        modal: {
          ondismiss: function() {
            setIsLoading(false)
            setShowCheckoutModal(false)
            console.log('Payment cancelled by user')
          }
        },
        recurring: 1, // Enable UPI AutoPay/Recurring mandate
      }

      const rzp = new (window as any).Razorpay(options)
      rzp.open()
    } catch (error: any) {
      console.error('Payment error:', error)
      const errorMessage = error.message || 'Failed to initiate payment. Please try again.'
      
      if (typeof window !== 'undefined') {
        alert(errorMessage)
      }
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
