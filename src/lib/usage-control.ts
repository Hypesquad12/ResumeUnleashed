import { createClient } from '@/lib/supabase/server'

export type FeatureType = 'ai_customization' | 'interview_prep' | 'job_matching' | 'cover_letter'

/**
 * Check if user has remaining usage for a feature
 */
export async function checkUsageLimit(userId: string, featureType: FeatureType): Promise<boolean> {
  const supabase = await createClient()
  
  try {
    const { data, error } = await supabase.rpc('check_usage_limit', {
      p_user_id: userId,
      p_feature_type: featureType
    })
    
    if (error) {
      console.error('Usage check error:', error)
      return false
    }
    
    return data === true
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
    const { error } = await supabase.rpc('increment_usage', {
      p_user_id: userId,
      p_feature_type: featureType
    })
    
    if (error) {
      console.error('Usage increment error:', error)
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
      .select(`
        *,
        plan:subscription_plans(*)
      `)
      .eq('user_id', userId)
      .eq('status', 'active')
      .single()
    
    if (subError || !subscription) {
      return null
    }
    
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
      plan: subscription.plan
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
      .select(`
        *,
        plan:subscription_plans(*)
      `)
      .eq('user_id', userId)
      .eq('status', 'active')
      .single()
    
    if (subError || !subscription) {
      // No active subscription - allow 1 resume (free tier)
      const { count } = await supabase
        .from('resumes')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
      
      return (count || 0) < 1
    }
    
    const limits = subscription.plan.limits as any
    const resumeLimit = limits.resumes || 1
    
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
      .select(`
        *,
        plan:subscription_plans(tier)
      `)
      .eq('user_id', userId)
      .eq('status', 'active')
      .single()
    
    if (error || !subscription) {
      return 'free'
    }
    
    return subscription.plan.tier || 'free'
  } catch (error) {
    console.error('Get tier exception:', error)
    return 'free'
  }
}
