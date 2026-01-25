'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Zap, TrendingUp, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

interface UpgradeModalProps {
  open: boolean
  onClose: () => void
  feature: string
  current: number
  limit: number
  tier: string
  isTrialActive?: boolean
}

export function UpgradeModal({ open, onClose, feature, current, limit, tier, isTrialActive }: UpgradeModalProps) {
  const router = useRouter()
  const [isActivating, setIsActivating] = useState(false)

  const handleActivateNow = async () => {
    setIsActivating(true)
    try {
      const response = await fetch('/api/razorpay/activate-trial', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to activate subscription')
      }

      // If new subscription requires authentication, open payment link
      if (data.requiresAuthentication && data.shortUrl) {
        toast.success('Opening payment authentication...')
        window.location.href = data.shortUrl
        return
      }

      // If mandate is already authenticated, show success and redirect
      toast.success('🎉 Payment activated! Your subscription will be charged shortly.')
      // Redirect to success page with payment type for Google Ads conversion tracking
      setTimeout(() => {
        window.location.href = '/conversion/mandate-success?type=payment'
      }, 1500)
    } catch (error) {
      console.error('Activation error:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to activate subscription')
      setIsActivating(false)
    }
  }

  const handleUpgrade = () => {
    onClose()
    router.push('/pricing')
  }

  const isFree = tier === 'free'
  const showActivateButton = isTrialActive && !isFree

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="mx-auto w-12 h-12 rounded-full bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center mb-4">
            <Zap className="h-6 w-6 text-white" />
          </div>
          <DialogTitle className="text-center">
            {showActivateButton ? 'Activate Your Subscription' : (isFree ? 'Upgrade to Get Started' : 'Upgrade Your Plan')}
          </DialogTitle>
          <DialogDescription className="text-center">
            {showActivateButton ? (
              <>
                You've reached your <strong>trial limit</strong> of <strong>{limit}</strong> {feature}.
                <br />
                <strong>Complete your payment now</strong> to unlock full features and continue using the app!
              </>
            ) : isFree ? (
              <>
                You've reached your <strong>free trial limit</strong> of <strong>{limit}</strong> {feature}.
                <br />
                Upgrade to a paid plan to continue using this feature!
              </>
            ) : (
              <>
                You've used <strong>{current}</strong> of <strong>{limit}</strong> {feature} this month.
                <br />
                Upgrade to get more features and higher limits!
              </>
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="bg-gradient-to-br from-violet-50 to-purple-50 rounded-lg p-4 my-4 border border-violet-100">
          <div className="flex items-start gap-3">
            <TrendingUp className="h-5 w-5 text-violet-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-slate-700">
              <p className="font-medium mb-2">Upgrade benefits:</p>
              <ul className="space-y-1 text-sm">
                <li>✓ Higher monthly limits or unlimited access</li>
                <li>✓ All premium templates</li>
                <li>✓ Advanced AI customization</li>
                <li>✓ Interview prep sessions</li>
                <li>✓ Priority support</li>
              </ul>
            </div>
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-col gap-2">
          {showActivateButton ? (
            <>
              <Button 
                onClick={handleActivateNow} 
                disabled={isActivating}
                className="w-full bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600"
              >
                {isActivating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Activating...
                  </>
                ) : (
                  <>
                    <Zap className="mr-2 h-4 w-4" />
                    Complete Payment & Activate Now
                  </>
                )}
              </Button>
              <Button 
                onClick={onClose} 
                variant="outline"
                className="w-full"
                disabled={isActivating}
              >
                Maybe Later
              </Button>
            </>
          ) : (
            <Button onClick={handleUpgrade} className="w-full bg-gradient-to-r from-violet-500 to-purple-500 hover:from-violet-600 hover:to-purple-600">
              <Zap className="mr-2 h-4 w-4" />
              Upgrade Now
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
