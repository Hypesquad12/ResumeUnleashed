'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { isFreeTierUser } from '@/lib/subscription-limits'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Sparkles, TrendingUp, Zap } from 'lucide-react'

/**
 * Component that checks if user is on free tier and prompts them to upgrade
 * Should be added to dashboard layout to check on all dashboard pages
 */
export function FreeTierPrompt() {
  const router = useRouter()
  const pathname = usePathname()
  const [showModal, setShowModal] = useState(false)
  const [isChecking, setIsChecking] = useState(true)

  // Pages where we don't want to show the modal
  const excludedPaths = ['/pricing', '/checkout', '/settings']

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

  const handleUpgrade = () => {
    router.push('/pricing')
  }

  if (isChecking) return null

  return (
    <Dialog open={showModal} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-lg" onPointerDownOutside={(e) => e.preventDefault()} onEscapeKeyDown={(e) => e.preventDefault()}>
        <DialogHeader>
          <div className="mx-auto w-16 h-16 rounded-full bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center mb-4">
            <Sparkles className="h-8 w-8 text-white" />
          </div>
          <DialogTitle className="text-center text-2xl">
            Welcome to Resume Unleashed! 🎉
          </DialogTitle>
          <DialogDescription className="text-center text-base">
            Start your 7-day free trial to unlock all features. Choose a plan that works for you—cancel anytime during the trial at no cost.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="bg-gradient-to-br from-violet-50 to-purple-50 rounded-lg p-4 border border-violet-100">
            <div className="flex items-start gap-3">
              <Zap className="h-5 w-5 text-violet-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-slate-700">
                <p className="font-semibold mb-2">What you'll get:</p>
                <ul className="space-y-1.5 text-sm">
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-600">✓</span>
                    <span>AI-powered resume customization</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-600">✓</span>
                    <span>Professional templates & ATS optimization</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-600">✓</span>
                    <span>Interview prep sessions</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-600">✓</span>
                    <span>Digital visiting cards with QR codes</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-600">✓</span>
                    <span>7 day free trial on all plans</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

        </div>

        <DialogFooter>
          <Button onClick={handleUpgrade} className="w-full bg-gradient-to-r from-violet-500 to-purple-500 hover:from-violet-600 hover:to-purple-600">
            <Sparkles className="mr-2 h-4 w-4" />
            Choose a Plan Now
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
