// Stub file - payment features removed
export type Region = 'india' | 'us' | 'eu' | 'uk' | 'other'
export type SubscriptionTier = 'free' | 'premium'
export type BillingCycle = 'monthly' | 'annual'

export interface PricingPlan {
  id: string
  tier: SubscriptionTier
  name: string
  price: number
  currency: string
}

export function getPricingByRegion(region: Region): PricingPlan[] {
  return []
}

export function formatPrice(price: number, currency: string): string {
  return `${currency} ${price}`
}

export function calculateSavings(monthly: number, annual: number): number {
  return 0
}

export function getPlanLimits(tier: SubscriptionTier) {
  return {
    resumes: tier === 'premium' ? 999 : 3,
    customizations: tier === 'premium' ? 999 : 5,
    coverLetters: tier === 'premium' ? 999 : 3,
    interviews: tier === 'premium' ? 999 : 3,
    cards: tier === 'premium' ? 999 : 2,
  }
}

export const TRIAL_LIMITS = {
  resumes: 3,
  customizations: 5,
  coverLetters: 3,
  interviews: 3,
  cards: 2,
}
