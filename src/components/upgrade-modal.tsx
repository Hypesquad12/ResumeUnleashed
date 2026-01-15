'use client'

import { useRouter } from 'next/navigation'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Zap, TrendingUp } from 'lucide-react'

interface UpgradeModalProps {
  open: boolean
  onClose: () => void
  feature: string
  current: number
  limit: number
  tier: string
}

export function UpgradeModal({ open, onClose, feature, current, limit, tier }: UpgradeModalProps) {
  const router = useRouter()

  const handleUpgrade = () => {
    onClose()
    router.push('/pricing')
  }

  const isFree = tier === 'free'

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="mx-auto w-12 h-12 rounded-full bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center mb-4">
            <Zap className="h-6 w-6 text-white" />
          </div>
          <DialogTitle className="text-center">
            {isFree ? 'Upgrade to Get Started' : 'Upgrade Your Plan'}
          </DialogTitle>
          <DialogDescription className="text-center">
            {isFree ? (
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

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={onClose} className="w-full sm:w-auto">
            Maybe Later
          </Button>
          <Button onClick={handleUpgrade} className="w-full sm:w-auto bg-gradient-to-r from-violet-500 to-purple-500 hover:from-violet-600 hover:to-purple-600">
            <Zap className="mr-2 h-4 w-4" />
            View Plans
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
