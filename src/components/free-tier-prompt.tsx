'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { isFreeTierUser } from '@/lib/subscription-limits'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Sparkles, Check, Loader2, Crown, Calendar, Shield } from 'lucide-react'
import { indiaPricing, rowPricing, formatPrice, calculateSavings, type BillingCycle, type PricingPlan } from '@/lib/pricing-config'
import { detectUserRegion } from '@/lib/geo-detection'

/**
 * Component that checks if user is on free tier and prompts them to upgrade
 * Shows plan selection directly and takes user to mandate setup
 */
export function FreeTierPrompt() {
  const pathname = usePathname()
  const [showModal, setShowModal] = useState(false)
  const [isChecking, setIsChecking] = useState(true)
  const [billingCycle, setBillingCycle] = useState<BillingCycle>('monthly')
  const [selectedPlan, setSelectedPlan] = useState<PricingPlan | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [region, setRegion] = useState<'india' | 'row'>('india')

  // Pages where we don't want to show the modal
  const excludedPaths = ['/pricing', '/checkout', '/settings']

  useEffect(() => {
    async function detectRegion() {
      try {
        const detected = await detectUserRegion()
        setRegion(detected)
      } catch (error) {
        console.error('Failed to detect region:', error)
        setRegion('row')
      }
    }
    detectRegion()
  }, [])

  useEffect(() => {
    async function checkTier() {
      // Don't check on excluded paths
      if (excludedPaths.some(path => pathname?.includes(path))) {
        setIsChecking(false)
        return
      }

      const isFree = await isFreeTierUser()
      
      if (isFree) {
        // Check if user has dismissed the prompt in this session
        const dismissed = sessionStorage.getItem('free_tier_prompt_dismissed')
        if (!dismissed) {
          setShowModal(true)
        }
      }
      
      setIsChecking(false)
    }

    checkTier()
  }, [pathname])

  const plans = region === 'india' ? indiaPricing : rowPricing

  const handleSelectPlan = async (plan: PricingPlan) => {
    setSelectedPlan(plan)
    setIsLoading(true)

    try {
      const response = await fetch('/api/razorpay/create-subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planId: plan.id,
          billingCycle,
          region: plan.region,
          tier: plan.tier,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create subscription')
      }

      // Load Razorpay Checkout script dynamically
      const loadRazorpay = () => {
        return new Promise((resolve) => {
          const script = document.createElement('script')
          script.src = 'https://checkout.razorpay.com/v1/checkout.js'
          script.onload = () => resolve(true)
          script.onerror = () => resolve(false)
          document.body.appendChild(script)
        })
      }

      await loadRazorpay()

      // Close trial popup before opening Razorpay to prevent overlay blocking
      setShowModal(false)

      // Open Razorpay Standard Checkout modal for subscription authentication
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        subscription_id: data.subscriptionId,
        name: 'Resume Unleashed',
        description: `${plan.name} Plan - 7 Day Trial`,
        image: '/logo.png',
        callback_url: `${window.location.origin}/api/razorpay/subscription-callback`,
        prefill: {
          name: '',
          email: '',
        },
        theme: {
          color: '#8b5cf6',
        },
        modal: {
          ondismiss: () => {
            setIsLoading(false)
            setSelectedPlan(null)
          },
        },
      }

      // @ts-ignore - Razorpay is loaded dynamically
      const razorpay = new window.Razorpay(options)
      razorpay.open()
      
    } catch (error) {
      console.error('Subscription error:', error)
      setIsLoading(false)
      setSelectedPlan(null)
    }
  }

  const getPrice = (plan: PricingPlan) => {
    return billingCycle === 'monthly' ? plan.priceMonthly : plan.priceAnnual
  }

  const getOriginalPrice = (plan: PricingPlan) => {
    return billingCycle === 'monthly' ? plan.originalPriceMonthly : plan.originalPriceAnnual
  }

  if (isChecking) return null

  return (
    <Dialog open={showModal} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto" showCloseButton={false} onPointerDownOutside={(e) => e.preventDefault()} onEscapeKeyDown={(e) => e.preventDefault()}>
        <DialogHeader>
          <div className="mx-auto w-14 h-14 rounded-full bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center mb-3">
            <Sparkles className="h-7 w-7 text-white" />
          </div>
          <DialogTitle className="text-center text-xl">
            Choose Your Plan to Start Free Trial
          </DialogTitle>
          <DialogDescription className="text-center text-sm">
            Select a plan to proceed. You won't be charged during the 7-day trial—cancel anytime.
          </DialogDescription>
        </DialogHeader>

        {/* Billing Toggle */}
        <div className="flex justify-center my-4">
          <div className="inline-flex items-center bg-slate-100 rounded-full p-1">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                billingCycle === 'monthly'
                  ? 'bg-white text-violet-600 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingCycle('annual')}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                billingCycle === 'annual'
                  ? 'bg-white text-violet-600 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Annual
              <span className="ml-1 text-xs text-emerald-600 font-semibold">Save 25%</span>
            </button>
          </div>
        </div>

        {/* Billing Summary - Enhanced */}
        <div className="mb-4 bg-gradient-to-r from-emerald-50 to-green-50 border-2 border-emerald-300 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-emerald-500 flex items-center justify-center shadow-md">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-xl font-bold text-emerald-900">Due Today: {region === 'india' ? '₹0' : '$0'}</p>
                <p className="text-sm font-medium text-emerald-700">No payment required now • Free 7-day trial</p>
              </div>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-1.5 text-sm text-slate-600">
                <Calendar className="h-4 w-4" />
                <span>First charge on</span>
              </div>
              <p className="font-semibold text-slate-800">
                {new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { 
                  month: 'short', 
                  day: 'numeric', 
                  year: 'numeric' 
                })}
              </p>
            </div>
          </div>
        </div>

        {/* Plan Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {plans.map((plan) => {
            const savings = calculateSavings(plan.priceMonthly, plan.priceAnnual)
            const isSelected = selectedPlan?.id === plan.id && isLoading
            
            return (
              <div
                key={plan.id}
                className={`relative rounded-xl border-2 p-4 transition-all flex flex-col ${
                  plan.popular
                    ? 'border-violet-500 bg-violet-50/50'
                    : 'border-slate-200 hover:border-violet-300'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="bg-gradient-to-r from-violet-500 to-purple-500 text-white text-xs font-semibold px-3 py-1 rounded-full flex items-center gap-1">
                      <Crown className="h-3 w-3" /> POPULAR
                    </span>
                  </div>
                )}
                
                <div className="text-center mb-3 mt-1">
                  <h3 className="font-semibold text-slate-900">{plan.name}</h3>
                  <div className="mt-2">
                    {getOriginalPrice(plan) && (
                      <span className="text-sm text-slate-400 line-through mr-2">
                        {formatPrice(getOriginalPrice(plan)!, plan.currency)}
                      </span>
                    )}
                    <span className="text-2xl font-bold text-slate-900">
                      {formatPrice(getPrice(plan), plan.currency)}
                    </span>
                    <span className="text-sm text-slate-500">
                      /{billingCycle === 'monthly' ? 'mo' : 'yr'}
                    </span>
                  </div>
                  {billingCycle === 'annual' && (
                    <p className="text-xs text-emerald-600 mt-1">
                      Save {formatPrice(savings.amount, plan.currency)}/year
                    </p>
                  )}
                </div>

                <ul className="space-y-1.5 text-xs text-slate-600 mb-4 flex-grow">
                  <li className="flex items-center gap-1.5">
                    <Check className="h-3.5 w-3.5 text-emerald-500 flex-shrink-0" />
                    {plan.features.templates === 'all' ? 'All templates' : `${plan.features.templates} templates`}
                  </li>
                  <li className="flex items-center gap-1.5">
                    <Check className="h-3.5 w-3.5 text-emerald-500 flex-shrink-0" />
                    {plan.limits.customizations} AI customizations
                  </li>
                  <li className="flex items-center gap-1.5">
                    <Check className="h-3.5 w-3.5 text-emerald-500 flex-shrink-0" />
                    {plan.limits.interviews} interview sessions
                  </li>
                  <li className="flex items-center gap-1.5">
                    <Check className="h-3.5 w-3.5 text-emerald-500 flex-shrink-0" />
                    {plan.features.coverLetter ? 'Cover letters included' : 'Basic features'}
                  </li>
                </ul>

                <Button
                  onClick={() => handleSelectPlan(plan)}
                  disabled={isLoading}
                  className={`w-full text-sm mt-auto ${
                    plan.popular
                      ? 'bg-gradient-to-r from-violet-500 to-purple-500 hover:from-violet-600 hover:to-purple-600'
                      : 'bg-slate-900 hover:bg-slate-800'
                  }`}
                >
                  {isSelected ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Setting up...
                    </>
                  ) : (
                    'Start Free Trial'
                  )}
                </Button>
              </div>
            )
          })}
        </div>

        <p className="text-center text-xs text-slate-500 mt-3">
          7-day free trial • Cancel anytime before trial ends to avoid charges
        </p>
      </DialogContent>
    </Dialog>
  )
}
