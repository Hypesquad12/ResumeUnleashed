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
  isTrialActive?: boolean
} | null> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return null

  // Check user's subscription in profiles table
  const { data: profile } = await (supabase as any)
    .from('profiles')
    .select('subscription_tier, subscription_region')
    .eq('id', user.id)
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
        resumes: 1, // Allow 1 resume for all users including free
        customizations: 2, // Trial: 2 customizations
        interviews: 1, // Trial: 1 interview
        jobMatching: 0,
        coverLetters: 0,
      },
      isTrialActive: false,
    }
  }

  // Check if user is in trial period (for paid plans)
  const { data: subscription } = await (supabase as any)
    .from('subscriptions')
    .select('trial_active, status')
    .eq('user_id', user.id)
    .single()

  const isTrialActive = subscription?.trial_active === true && subscription?.status === 'active'

  // During trial period, enforce trial limits for all paid plans
  if (isTrialActive) {
    return {
      tier,
      region,
      limits: {
        resumes: 1, // All users limited to 1 resume
        customizations: 2, // Trial: 2 customizations
        interviews: 1, // Trial: 1 interview (5 min limit enforced in interview component)
        jobMatching: 0,
        coverLetters: 0,
      },
      isTrialActive: true,
    }
  }

  // Get plan limits from pricing config (full limits after trial)
  const plans = getPricingByRegion(region)
  const plan = plans.find(p => p.tier === tier)
  
  if (!plan) return null

  return {
    tier,
    region,
    limits: {
      resumes: 1, // All users limited to 1 resume (must delete to create new)
      customizations: plan.limits.customizations,
      interviews: plan.limits.interviews,
      jobMatching: plan.limits.jobMatching,
      coverLetters: plan.limits.coverLetters || 0,
    },
    isTrialActive: false,
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

  // Count total resumes (not monthly since limit is 1 total)
  const { count: resumeCount } = await (supabase as any)
    .from('resumes')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)

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
  isTrialActive?: boolean
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

  // -1 means unlimited (but only for non-trial paid users)
  if (limit === -1 && !subscription.isTrialActive) {
    return {
      allowed: true,
      current,
      limit: -1,
      tier: subscription.tier,
      isTrialActive: subscription.isTrialActive,
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
      isTrialActive: false,
    }
  }

  const allowed = current < limit

  // Custom message for trial users who hit limits
  let reason: string | undefined
  if (!allowed) {
    if (subscription.isTrialActive) {
      reason = `Trial limit reached (${limit} ${action}). Complete payment to unlock full features and higher limits!`
    } else {
      reason = `You've reached your monthly limit of ${limit} ${action}. Upgrade for more!`
    }
  }

  return {
    allowed,
    reason,
    current,
    limit,
    tier: subscription.tier,
    isTrialActive: subscription.isTrialActive,
  }
}

/**
 * Check if user is on free tier and needs to upgrade
 */
export async function isFreeTierUser(): Promise<boolean> {
  const subscription = await getUserSubscription()
  return !subscription || subscription.tier === 'free'
}

/**
 * Check if user has ever had a paid subscription (to determine trial eligibility)
 */
export async function hasHadPaidSubscription(): Promise<boolean> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return false

  // Check if user has any subscription record (active, cancelled, or expired)
  const { data: subscriptions } = await supabase
    .from('subscriptions')
    .select('id, status')
    .eq('user_id', user.id)
    .in('status', ['active', 'cancelled', 'expired'])
    .limit(1)

  return (subscriptions && subscriptions.length > 0) || false
}
