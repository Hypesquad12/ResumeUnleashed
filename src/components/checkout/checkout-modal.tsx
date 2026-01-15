'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2, Tag, Check, X, CreditCard } from 'lucide-react'
import { PricingPlan, BillingCycle, formatPrice } from '@/lib/pricing-config'
import { toast } from 'sonner'

interface CheckoutModalProps {
  open: boolean
  onClose: () => void
  plan: PricingPlan
  billingCycle: BillingCycle
  onProceed: (couponCode?: string) => void
  isLoading?: boolean
}

export function CheckoutModal({ open, onClose, plan, billingCycle, onProceed, isLoading }: CheckoutModalProps) {
  const [couponCode, setCouponCode] = useState('')
  const [validatingCoupon, setValidatingCoupon] = useState(false)
  const [couponData, setCouponData] = useState<any>(null)
  const [couponError, setCouponError] = useState('')

  const baseAmount = billingCycle === 'monthly' ? plan.priceMonthly : plan.priceAnnual
  const originalPrice = billingCycle === 'monthly' ? plan.originalPriceMonthly : plan.originalPriceAnnual
  const trialDays = billingCycle === 'monthly' ? plan.trialDays : plan.trialDaysAnnual
  const finalAmount = couponData ? couponData.finalAmount : baseAmount

  const validateCoupon = async () => {
    if (!couponCode.trim()) {
      setCouponData(null)
      setCouponError('')
      return
    }

    setValidatingCoupon(true)
    setCouponError('')

    try {
      const response = await fetch('/api/razorpay/validate-coupon', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ couponCode, planAmount: baseAmount }),
      })

      const data = await response.json()

      if (data.valid) {
        setCouponData(data)
        setCouponError('')
        toast.success('Promo code applied!')
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

  const handleProceed = () => {
    onProceed(couponData?.couponCode)
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Checkout
          </DialogTitle>
          <DialogDescription>
            Complete your purchase for {plan.name} plan
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Trial Period Notice */}
          {trialDays && (
            <div className="bg-violet-50 dark:bg-violet-900/20 border border-violet-200 dark:border-violet-800 rounded-lg p-4">
              <div className="flex items-center gap-2 text-violet-700 dark:text-violet-300 font-semibold mb-1">
                <Check className="h-5 w-5" />
                {trialDays}-Day Free Trial Included
              </div>
              <p className="text-sm text-violet-600 dark:text-violet-400">
                You won't be charged until your trial ends. Cancel anytime during the trial period.
              </p>
            </div>
          )}

          {/* Plan Summary */}
          <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-4 space-y-2">
            <div className="flex justify-between items-center">
              <span className="font-semibold">{plan.name}</span>
              <span className="text-sm text-muted-foreground">{billingCycle === 'monthly' ? 'Monthly' : 'Annual'}</span>
            </div>
            {originalPrice && (
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Original Price</span>
                <span className="line-through text-muted-foreground">{formatPrice(originalPrice, plan.currency)}</span>
              </div>
            )}
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">{originalPrice ? 'Discounted Price' : 'Price'}</span>
              <span className={originalPrice ? 'text-green-600 font-semibold' : ''}>{formatPrice(baseAmount, plan.currency)}</span>
            </div>
            {couponData && (
              <>
                <div className="flex justify-between items-center text-sm text-green-600">
                  <span>Discount ({couponData.couponCode})</span>
                  <span>-{formatPrice(couponData.discountAmount, plan.currency)}</span>
                </div>
                <div className="border-t pt-2 flex justify-between items-center font-bold">
                  <span>Total</span>
                  <span className="text-lg">{formatPrice(finalAmount, plan.currency)}</span>
                </div>
              </>
            )}
            {!couponData && (
              <div className="border-t pt-2 flex justify-between items-center font-bold">
                <span>Total</span>
                <span className="text-lg">{formatPrice(baseAmount, plan.currency)}</span>
              </div>
            )}
          </div>

          {/* Promo Code Section */}
          <div className="space-y-3">
            <Label className="flex items-center gap-2 text-sm font-semibold">
              <Tag className="h-4 w-4 text-violet-600" />
              Have a promo code?
            </Label>
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <Input
                  type="text"
                  placeholder="Enter code"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                  onKeyDown={(e) => e.key === 'Enter' && validateCoupon()}
                  className="pr-8"
                  disabled={validatingCoupon || isLoading}
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
                onClick={validateCoupon}
                disabled={!couponCode.trim() || validatingCoupon || isLoading}
              >
                {validatingCoupon ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Apply'}
              </Button>
            </div>
            {couponData && (
              <div className="text-sm text-green-700 font-medium">
                ✓ {couponData.discountType === 'percentage' 
                  ? `${couponData.discount}% off` 
                  : `${formatPrice(couponData.discountAmount, plan.currency)} off`} applied!
              </div>
            )}
            {couponError && (
              <div className="text-sm text-red-600">
                {couponError}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleProceed}
              disabled={isLoading}
              className="flex-1 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                `Pay ${formatPrice(finalAmount, plan.currency)}`
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
