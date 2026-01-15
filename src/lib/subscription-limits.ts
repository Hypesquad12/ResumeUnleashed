import { createClient } from '@/lib/supabase/client'
import { SubscriptionTier, PricingPlan, getPricingByRegion } from '@/lib/pricing-config'

export interface UsageLimits {
  resumes: number
  customizations: number
  interviews: number
  jobMatching: number
  coverLetters: number
}

export interface CurrentUsage {
  resumes: number
  customizations: number
  interviews: number
  jobMatching: number
  coverLetters: number
}

/**
 * Get the current user's subscription tier and limits
 */
export async function getUserSubscription(): Promise<{
  tier: SubscriptionTier | 'free'
  limits: UsageLimits
  region: 'india' | 'row'
} | null> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return null

  // Check user's subscription in profiles table
  const { data: profile } = await (supabase as any)
    .from('profiles')
    .select('subscription_tier, subscription_region')
    .eq('user_id', user.id)
    .single()

  if (!profile) return null

  const tier = profile.subscription_tier || 'free'
  const region = profile.subscription_region || 'india'

  // Get limits based on tier
  if (tier === 'free') {
    return {
      tier: 'free',
      region,
      limits: {
        resumes: 0,
        customizations: 0,
        interviews: 0,
        jobMatching: 0,
        coverLetters: 0,
      }
    }
  }

  // Get plan limits from pricing config
  const plans = getPricingByRegion(region)
  const plan = plans.find(p => p.tier === tier)
  
  if (!plan) return null

  return {
    tier,
    region,
    limits: {
      resumes: plan.limits.resumes,
      customizations: plan.limits.customizations,
      interviews: plan.limits.interviews,
      jobMatching: plan.limits.jobMatching,
      coverLetters: plan.limits.coverLetters || 0,
    }
  }
}

/**
 * Get current usage for the user (monthly counts)
 */
export async function getCurrentUsage(): Promise<CurrentUsage> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return {
      resumes: 0,
      customizations: 0,
      interviews: 0,
      jobMatching: 0,
      coverLetters: 0,
    }
  }

  // Get start of current month
  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()

  // Count resumes created this month
  const { count: resumeCount } = await (supabase as any)
    .from('resumes')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .gte('created_at', startOfMonth)

  // Count customizations this month
  const { count: customizationCount } = await (supabase as any)
    .from('customized_resumes')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .gte('created_at', startOfMonth)

  // Count interviews this month
  const { count: interviewCount } = await (supabase as any)
    .from('interview_sessions')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .gte('created_at', startOfMonth)

  // Count job descriptions this month (for job matching)
  const { count: jobMatchingCount } = await (supabase as any)
    .from('job_descriptions')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .gte('created_at', startOfMonth)

  // Count cover letters generated this month (stored in customized_resumes.cover_letter)
  const { data: coverLetters } = await (supabase as any)
    .from('customized_resumes')
    .select('cover_letter')
    .eq('user_id', user.id)
    .gte('created_at', startOfMonth)
    .not('cover_letter', 'is', null)

  return {
    resumes: resumeCount || 0,
    customizations: customizationCount || 0,
    interviews: interviewCount || 0,
    jobMatching: jobMatchingCount || 0,
    coverLetters: coverLetters?.length || 0,
  }
}

/**
 * Check if user can perform an action based on their limits
 */
export async function canPerformAction(action: keyof UsageLimits): Promise<{
  allowed: boolean
  reason?: string
  current: number
  limit: number
  tier: SubscriptionTier | 'free'
}> {
  const subscription = await getUserSubscription()
  
  if (!subscription) {
    return {
      allowed: false,
      reason: 'Please log in to continue',
      current: 0,
      limit: 0,
      tier: 'free',
    }
  }

  const usage = await getCurrentUsage()
  const current = usage[action]
  const limit = subscription.limits[action]

  // -1 means unlimited
  if (limit === -1) {
    return {
      allowed: true,
      current,
      limit: -1,
      tier: subscription.tier,
    }
  }

  // Free tier - always blocked
  if (subscription.tier === 'free') {
    return {
      allowed: false,
      reason: 'Please upgrade to a paid plan to access this feature',
      current,
      limit,
      tier: subscription.tier,
    }
  }

  const allowed = current < limit

  return {
    allowed,
    reason: allowed ? undefined : `You've reached your monthly limit of ${limit} ${action}. Upgrade for more!`,
    current,
    limit,
    tier: subscription.tier,
  }
}

/**
 * Check if user is on free tier and needs to upgrade
 */
export async function isFreeTierUser(): Promise<boolean> {
  const subscription = await getUserSubscription()
  return subscription?.tier === 'free' || !subscription
}
