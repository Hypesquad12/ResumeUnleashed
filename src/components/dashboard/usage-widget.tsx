
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Sparkles, FileText, MessageSquare, Briefcase, Crown } from 'lucide-react'
import { Link } from 'react-router-dom'

interface UsageData {
  feature_type: string
  usage_count: number | null
}

interface PlanLimits {
  resumes: number
  customizations: number
  interviews: number
  job_matching: number
  cover_letters?: number
}

export function UsageWidget() {
  const [usage, setUsage] = useState<UsageData[]>([])
  const [limits, setLimits] = useState<PlanLimits | null>(null)
  const [tier, setTier] = useState<string>('free')
  const [resumeCount, setResumeCount] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadUsageData()
  }, [])

  const loadUsageData = async () => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) return

    try {
      // Get usage for current period - use actual counts from tables (for all users)
      const startOfMonth = new Date()
      startOfMonth.setDate(1)
      startOfMonth.setHours(0, 0, 0, 0)

      // Count customizations from current month
      const { count: customizationCount } = await supabase
        .from('customized_resumes')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .gte('created_at', startOfMonth.toISOString())

      // Count interviews from current month
      const { count: interviewCount } = await (supabase as any)
        .from('interview_sessions')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .gte('created_at', startOfMonth.toISOString())

      // Build usage data array
      const usageData: UsageData[] = [
        { feature_type: 'ai_customization', usage_count: customizationCount || 0 },
        { feature_type: 'interview_prep', usage_count: interviewCount || 0 },
        { feature_type: 'job_matching', usage_count: 0 },
      ]

      setUsage(usageData)

      // Get active subscription with plan details
      const { data: subscription } = await supabase
        .from('subscriptions')
        .select(`
          *,
          plan:subscription_plans(*)
        `)
        .eq('user_id', user.id)
        .eq('status', 'active')
        .single()

      if (subscription?.plan) {
        const planData = subscription.plan as any
        setLimits(planData.limits as PlanLimits)
        setTier(planData.tier || 'free')
      } else {
        // Free tier - set default limits (matches subscription-limits.ts)
        setLimits({ resumes: 1, customizations: 2, interviews: 1, job_matching: 0 })
        setTier('free')
      }

      // Get resume count
      const { count } = await supabase
        .from('resumes')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)

      setResumeCount(count || 0)
    } catch (error) {
      console.error('Failed to load usage data:', error)
    } finally {
      setLoading(false)
    }
  }

  const getUsageCount = (featureType: string) => {
    const item = usage.find(u => u.feature_type === featureType)
    return item?.usage_count ?? 0
  }

  const getPercentage = (used: number, limit: number) => {
    if (limit === -1) return 0 // Unlimited
    return Math.min((used / limit) * 100, 100)
  }

  const getTierBadge = () => {
    const colors: Record<string, string> = {
      free: 'bg-gray-500',
      professional: 'bg-blue-500',
      premium: 'bg-purple-500',
      ultimate: 'bg-amber-500'
    }
    return (
      <Badge className={`${colors[tier] || 'bg-gray-500'} text-white capitalize`}>
        {tier === 'ultimate' && <Crown className="w-3 h-3 mr-1" />}
        {tier}
      </Badge>
    )
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Usage & Limits</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-3">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!limits) return null

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Usage & Limits</CardTitle>
            <CardDescription>Your current plan usage</CardDescription>
          </div>
          {getTierBadge()}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Resumes */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-blue-500" />
              <span className="font-medium">Resumes</span>
            </div>
            <span className="text-muted-foreground">
              {resumeCount} / {limits.resumes === -1 ? '∞' : limits.resumes}
            </span>
          </div>
          {limits.resumes !== -1 && (
            <Progress value={getPercentage(resumeCount, limits.resumes)} className="h-2" />
          )}
        </div>

        {/* AI Customizations */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-500" />
              <span className="font-medium">AI Customizations</span>
            </div>
            <span className="text-muted-foreground">
              {getUsageCount('ai_customization')} / {limits.customizations === -1 ? '∞' : limits.customizations}
            </span>
          </div>
          {limits.customizations !== -1 && limits.customizations > 0 && (
            <Progress value={getPercentage(getUsageCount('ai_customization'), limits.customizations)} className="h-2" />
          )}
        </div>

        {/* Interview Prep */}
        {limits.interviews > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-green-500" />
                <span className="font-medium">Interview Sessions</span>
              </div>
              <span className="text-muted-foreground">
                {getUsageCount('interview_prep')} / {limits.interviews === -1 ? '∞' : limits.interviews}
              </span>
            </div>
            {limits.interviews !== -1 && (
              <Progress value={getPercentage(getUsageCount('interview_prep'), limits.interviews)} className="h-2" />
            )}
          </div>
        )}

        {/* Job Matching */}
        {limits.job_matching !== 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-orange-500" />
                <span className="font-medium">Job Matching</span>
              </div>
              <span className="text-muted-foreground">
                {limits.job_matching === -1 ? 'Unlimited' : `${getUsageCount('job_matching')} / ${limits.job_matching}`}
              </span>
            </div>
            {limits.job_matching !== -1 && (
              <Progress value={getPercentage(getUsageCount('job_matching'), limits.job_matching)} className="h-2" />
            )}
          </div>
        )}

        {tier === 'free' && (
          <div className="pt-4 border-t">
            <Link to="/pricing">
              <Button className="w-full" variant="default">
                <Crown className="w-4 h-4 mr-2" />
                Upgrade Plan
              </Button>
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
