'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import { getUserSubscription, getCurrentUsage, type UsageLimits, type CurrentUsage } from '@/lib/subscription-limits'
import { Sparkles, FileText, Wand2, MessageSquare, Briefcase, Mail, Loader2 } from 'lucide-react'

export function UsageStats() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [tier, setTier] = useState<string>('free')
  const [limits, setLimits] = useState<UsageLimits | null>(null)
  const [usage, setUsage] = useState<CurrentUsage | null>(null)

  useEffect(() => {
    async function loadUsage() {
      setLoading(true)
      const subscription = await getUserSubscription()
      const currentUsage = await getCurrentUsage()
      
      if (subscription) {
        setTier(subscription.tier)
        setLimits(subscription.limits)
      }
      setUsage(currentUsage)
      setLoading(false)
    }

    loadUsage()
  }, [])

  const getPercentage = (current: number, limit: number) => {
    if (limit === -1) return 0 // Unlimited
    return Math.min((current / limit) * 100, 100)
  }

  const getProgressColor = (percentage: number) => {
    if (percentage >= 90) return 'bg-red-500'
    if (percentage >= 70) return 'bg-amber-500'
    return 'bg-emerald-500'
  }

  const usageItems = [
    {
      icon: FileText,
      label: 'Resumes',
      current: usage?.resumes || 0,
      limit: limits?.resumes || 0,
      key: 'resumes' as keyof UsageLimits
    },
    {
      icon: Wand2,
      label: 'AI Customizations',
      current: usage?.customizations || 0,
      limit: limits?.customizations || 0,
      key: 'customizations' as keyof UsageLimits
    },
    {
      icon: MessageSquare,
      label: 'Interview Prep Sessions',
      current: usage?.interviews || 0,
      limit: limits?.interviews || 0,
      key: 'interviews' as keyof UsageLimits
    },
    {
      icon: Briefcase,
      label: 'Job Matching',
      current: usage?.jobMatching || 0,
      limit: limits?.jobMatching || 0,
      key: 'jobMatching' as keyof UsageLimits
    },
    {
      icon: Mail,
      label: 'Cover Letters',
      current: usage?.coverLetters || 0,
      limit: limits?.coverLetters || 0,
      key: 'coverLetters' as keyof UsageLimits
    },
  ]

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Usage Statistics</CardTitle>
          <CardDescription>Loading your usage data...</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-violet-600" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Usage Statistics</CardTitle>
            <CardDescription>
              Current plan: <span className="font-semibold capitalize text-slate-900">{tier}</span>
              {tier === 'free' && <span className="text-amber-600"> (Trial)</span>}
            </CardDescription>
          </div>
          {tier === 'free' && (
            <Button 
              onClick={() => router.push('/pricing')}
              className="bg-gradient-to-r from-violet-500 to-purple-500 hover:from-violet-600 hover:to-purple-600"
            >
              <Sparkles className="mr-2 h-4 w-4" />
              Upgrade Plan
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {usageItems.map((item) => {
          const percentage = getPercentage(item.current, item.limit)
          const isUnlimited = item.limit === -1
          const Icon = item.icon

          return (
            <div key={item.key} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Icon className="h-4 w-4 text-slate-600" />
                  <span className="text-sm font-medium text-slate-700">{item.label}</span>
                </div>
                <span className="text-sm font-semibold text-slate-900">
                  {item.current} / {isUnlimited ? '∞' : item.limit}
                </span>
              </div>
              {!isUnlimited && (
                <div className="relative h-2 w-full overflow-hidden rounded-full bg-slate-200">
                  <div 
                    className={`h-full transition-all ${getProgressColor(percentage)}`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              )}
              {isUnlimited && (
                <div className="h-2 bg-gradient-to-r from-emerald-500 to-green-500 rounded-full" />
              )}
            </div>
          )
        })}

        {tier === 'free' && (
          <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <div className="flex items-start gap-3">
              <Sparkles className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-amber-800">
                <p className="font-medium mb-1">Free Trial Limits</p>
                <p className="text-amber-700">
                  You're using the free trial. Upgrade to unlock unlimited features and higher limits!
                </p>
              </div>
            </div>
          </div>
        )}

        <p className="text-xs text-slate-500 pt-4 border-t">
          Usage resets monthly. Upgrade anytime for higher limits and premium features.
        </p>
      </CardContent>
    </Card>
  )
}
