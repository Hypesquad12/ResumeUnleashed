import { createClient } from '@/lib/supabase/server'

export type FeatureType = 'ai_customization' | 'interview_prep' | 'job_matching' | 'cover_letter'

/**
 * Check if user has remaining usage for a feature
 */
export async function checkUsageLimit(userId: string, featureType: FeatureType): Promise<boolean> {
  const supabase = await createClient()
  
  try {
    // Get active subscription with tier, region, trial_active
    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('tier, region, trial_active, current_period_start, current_period_end')
      .eq('user_id', userId)
      .in('status', ['active', 'authenticated'])
      .single()
    
    if (!subscription) {
      return false // No active subscription
    }

    // Get limits based on tier and trial status
    const { getPlanLimits, TRIAL_LIMITS } = await import('@/lib/pricing-config')
    const limits = subscription.trial_active 
      ? TRIAL_LIMITS 
      : getPlanLimits(subscription.tier, subscription.region)
    
    if (!limits) {
      return false
    }

    const featureKey = featureType === 'ai_customization' ? 'customizations' : 
                      featureType === 'cover_letter' ? 'coverLetters' : featureType
    const limit = (limits as any)[featureKey]
    
    // -1 means unlimited
    if (limit === -1) {
      return true
    }
    
    // 0 means feature not available
    if (limit === 0) {
      return false
    }

    // Get current usage
    const { data: usageData } = await supabase
      .from('usage_tracking')
      .select('usage_count')
      .eq('user_id', userId)
      .eq('feature_type', featureType)
      .eq('period_start', subscription.current_period_start)
      .eq('period_end', subscription.current_period_end)
      .single()

    const currentUsage = usageData?.usage_count ?? 0
    return currentUsage < limit
  } catch (error) {
    console.error('Usage check exception:', error)
    return false
  }
}

/**
 * Increment usage counter for a feature
 */
export async function incrementUsage(userId: string, featureType: FeatureType): Promise<void> {
  const supabase = await createClient()
  
  try {
    // Get active subscription period
    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('id, current_period_start, current_period_end')
      .eq('user_id', userId)
      .in('status', ['active', 'authenticated'])
      .single()

    if (!subscription) {
      console.error('No active subscription for user')
      return
    }

    // Upsert usage tracking
    const { error } = await supabase
      .from('usage_tracking')
      .upsert({
        user_id: userId,
        subscription_id: subscription.id,
        feature_type: featureType,
        usage_count: 1,
        period_start: subscription.current_period_start,
        period_end: subscription.current_period_end
      }, {
        onConflict: 'user_id,feature_type,period_start',
        ignoreDuplicates: false
      })
      .select()

    if (error) {
      // Try increment instead
      const { data: existing } = await supabase
        .from('usage_tracking')
        .select('usage_count')
        .eq('user_id', userId)
        .eq('feature_type', featureType)
        .eq('period_start', subscription.current_period_start)
        .single()

      if (existing) {
        await supabase
          .from('usage_tracking')
          .update({ usage_count: (existing.usage_count ?? 0) + 1 })
          .eq('user_id', userId)
          .eq('feature_type', featureType)
          .eq('period_start', subscription.current_period_start)
      }
    }
  } catch (error) {
    console.error('Usage increment exception:', error)
  }
}

/**
 * Get current usage for a user
 */
export async function getUserUsage(userId: string) {
  const supabase = await createClient()
  
  try {
    // Get active subscription
    const { data: subscription, error: subError } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .in('status', ['active', 'authenticated'])
      .single()
    
    if (subError || !subscription) {
      return null
    }

    // Get plan details separately
    const { data: plan } = await supabase
      .from('subscription_plans')
      .select('*')
      .eq('id', subscription.plan_id)
      .single()
    
    // Get usage tracking for current period
    const { data: usage, error: usageError } = await supabase
      .from('usage_tracking')
      .select('*')
      .eq('user_id', userId)
      .eq('period_start', subscription.current_period_start)
      .eq('period_end', subscription.current_period_end)
    
    if (usageError) {
      console.error('Usage fetch error:', usageError)
      return null
    }
    
    return {
      subscription,
      usage: usage || [],
      plan
    }
  } catch (error) {
    console.error('Get usage exception:', error)
    return null
  }
}

/**
 * Check if user can create more resumes
 */
export async function checkResumeLimit(userId: string): Promise<boolean> {
  const supabase = await createClient()
  
  try {
    // Get active subscription
    const { data: subscription, error: subError } = await supabase
      .from('subscriptions')
      .select('plan_id')
      .eq('user_id', userId)
      .in('status', ['active', 'authenticated'])
      .single()
    
    let resumeLimit = 1 // Default free tier

    if (!subError && subscription?.plan_id) {
      // Get plan limits
      const { data: plan } = await supabase
        .from('subscription_plans')
        .select('limits')
        .eq('id', subscription.plan_id)
        .single()
      
      if (plan?.limits) {
        const limits = plan.limits as any
        resumeLimit = limits.resumes ?? 1
      }
    }
    
    // -1 means unlimited
    if (resumeLimit === -1) {
      return true
    }
    
    // Count user's resumes
    const { count } = await supabase
      .from('resumes')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
    
    return (count || 0) < resumeLimit
  } catch (error) {
    console.error('Resume limit check exception:', error)
    return false
  }
}

/**
 * Get user's subscription tier
 */
export async function getUserSubscriptionTier(userId: string): Promise<string> {
  const supabase = await createClient()
  
  try {
    const { data: subscription, error } = await supabase
      .from('subscriptions')
      .select('plan_id')
      .eq('user_id', userId)
      .in('status', ['active', 'authenticated'])
      .single()
    
    if (error || !subscription?.plan_id) {
      return 'free'
    }

    // Get plan tier
    const { data: plan } = await supabase
      .from('subscription_plans')
      .select('tier')
      .eq('id', subscription.plan_id)
      .single()
    
    return (plan?.tier as string) || 'free'
  } catch (error) {
    console.error('Get tier exception:', error)
    return 'free'
  }
}
