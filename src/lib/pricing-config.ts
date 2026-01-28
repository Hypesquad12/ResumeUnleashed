export type SubscriptionTier = 'professional' | 'premium' | 'ultimate'
export type BillingCycle = 'monthly' | 'annual'
export type Region = 'india' | 'row'

export interface PricingPlan {
  id: string
  name: string
  tier: SubscriptionTier
  region: Region
  currency: string
  priceMonthly: number
  priceAnnual: number
  originalPriceMonthly?: number
  originalPriceAnnual?: number
  trialDays?: number
  trialDaysAnnual?: number
  features: {
    templates: number | 'all'
    aiCustomization: boolean
    atsOptimization: boolean | 'advanced'
    downloads: 'pdf_watermark' | 'pdf' | 'all_formats'
    jobMatching: 'none' | 'basic' | 'unlimited'
    interviewPrep: boolean | 'unlimited'
    visitingCards: number | 'unlimited'
    analytics?: boolean
    linkedinOptimization?: boolean
    coverLetter?: boolean
    resumeDistribution?: boolean
    support: string
  }
  limits: {
    resumes: number // -1 for unlimited
    customizations: number // -1 for unlimited
    interviews: number // -1 for unlimited
    jobMatching: number // -1 for unlimited
    coverLetters?: number // -1 for unlimited
  }
  popular?: boolean
  badge?: string
}

// India Pricing (INR)
export const indiaPricing: PricingPlan[] = [
  {
    id: 'india-professional',
    name: 'Professional',
    tier: 'professional',
    region: 'india',
    currency: 'INR',
    priceMonthly: 499,
    priceAnnual: 4491,
    originalPriceMonthly: 649,
    originalPriceAnnual: 5841,
    trialDays: 7,
    trialDaysAnnual: 7,
    features: {
      templates: 'all',
      aiCustomization: true,
      atsOptimization: true,
      downloads: 'pdf',
      jobMatching: 'basic',
      interviewPrep: true,
      visitingCards: 1,
      coverLetter: true,
      support: 'Email (48hr response)',
    },
    limits: {
      resumes: 1,
      customizations: 10,
      interviews: 5,
      jobMatching: 10,
      coverLetters: 10,
    },
  },
  {
    id: 'india-premium',
    name: 'Premium',
    tier: 'premium',
    region: 'india',
    currency: 'INR',
    priceMonthly: 799,
    priceAnnual: 7191,
    originalPriceMonthly: 1049,
    originalPriceAnnual: 9441,
    trialDays: 7,
    trialDaysAnnual: 7,
    popular: true,
    badge: 'BEST VALUE',
    features: {
      templates: 'all',
      aiCustomization: true,
      atsOptimization: 'advanced',
      downloads: 'all_formats',
      jobMatching: 'unlimited',
      interviewPrep: true,
      visitingCards: 3,
      analytics: true,
      linkedinOptimization: true,
      coverLetter: true,
      support: 'Priority (24hr response)',
    },
    limits: {
      resumes: 2,
      customizations: 25,
      interviews: 10,
      jobMatching: -1,
      coverLetters: 25,
    },
  },
  {
    id: 'india-ultimate',
    name: 'Ultimate',
    tier: 'ultimate',
    region: 'india',
    currency: 'INR',
    priceMonthly: 1099,
    priceAnnual: 9891,
    originalPriceMonthly: 1449,
    originalPriceAnnual: 13041,
    trialDays: 7,
    trialDaysAnnual: 7,
    features: {
      templates: 'all',
      aiCustomization: true,
      atsOptimization: 'advanced',
      downloads: 'all_formats',
      jobMatching: 'unlimited',
      interviewPrep: 'unlimited',
      visitingCards: 5,
      analytics: true,
      linkedinOptimization: true,
      coverLetter: true,
      resumeDistribution: true,
      support: 'Priority (12hr response)',
    },
    limits: {
      resumes: 3,
      customizations: 35,
      interviews: 15,
      jobMatching: -1,
      coverLetters: 35,
    },
  },
]

// Rest of World Pricing (displayed as USD, charged in INR)
// Exchange rate: ₹89 = $1
export const rowPricing: PricingPlan[] = [
  {
    id: 'row-professional',
    name: 'Professional',
    tier: 'professional',
    region: 'row',
    currency: 'USD',
    priceMonthly: 8.99,
    priceAnnual: 80.91,
    originalPriceMonthly: 11.99,
    originalPriceAnnual: 107.91,
    trialDays: 7,
    trialDaysAnnual: 7,
    features: {
      templates: 'all',
      aiCustomization: true,
      atsOptimization: true,
      downloads: 'pdf',
      jobMatching: 'basic',
      interviewPrep: true,
      visitingCards: 1,
      coverLetter: true,
      support: 'Email (48hr response)',
    },
    limits: {
      resumes: 1,
      customizations: 10,
      interviews: 5,
      jobMatching: 10,
      coverLetters: 10,
    },
  },
  {
    id: 'row-premium',
    name: 'Premium',
    tier: 'premium',
    region: 'row',
    currency: 'USD',
    priceMonthly: 12.99,
    priceAnnual: 116.91,
    originalPriceMonthly: 16.99,
    originalPriceAnnual: 152.91,
    trialDays: 7,
    trialDaysAnnual: 7,
    popular: true,
    badge: 'BEST VALUE',
    features: {
      templates: 'all',
      aiCustomization: true,
      atsOptimization: 'advanced',
      downloads: 'all_formats',
      jobMatching: 'unlimited',
      interviewPrep: true,
      visitingCards: 3,
      analytics: true,
      linkedinOptimization: true,
      coverLetter: true,
      support: 'Priority (24hr response)',
    },
    limits: {
      resumes: 2,
      customizations: 25,
      interviews: 10,
      jobMatching: -1,
      coverLetters: 25,
    },
  },
  {
    id: 'row-ultimate',
    name: 'Ultimate',
    tier: 'ultimate',
    region: 'row',
    currency: 'USD',
    priceMonthly: 15.99,
    priceAnnual: 143.91,
    originalPriceMonthly: 20.99,
    originalPriceAnnual: 188.91,
    trialDays: 7,
    trialDaysAnnual: 7,
    features: {
      templates: 'all',
      aiCustomization: true,
      atsOptimization: 'advanced',
      downloads: 'all_formats',
      jobMatching: 'unlimited',
      interviewPrep: 'unlimited',
      visitingCards: 5,
      analytics: true,
      linkedinOptimization: true,
      coverLetter: true,
      resumeDistribution: true,
      support: 'Priority (12hr response)',
    },
    limits: {
      resumes: 3,
      customizations: 35,
      interviews: 15,
      jobMatching: -1,
      coverLetters: 35,
    },
  },
]

// Helper function to get pricing based on region
export function getPricingByRegion(region: Region): PricingPlan[] {
  return region === 'india' ? indiaPricing : rowPricing
}

// Helper function to detect region from country code
export function getRegionFromCountry(countryCode: string): Region {
  return countryCode === 'IN' ? 'india' : 'row'
}

// Helper function to format price
export function formatPrice(amount: number, currency: string): string {
  if (currency === 'INR') {
    return `₹${amount.toLocaleString('en-IN')}`
  }
  return `$${amount.toFixed(2)}`
}

// Helper function to calculate savings
export function calculateSavings(monthly: number, annual: number): {
  amount: number
  percentage: number
} {
  const totalMonthly = monthly * 12
  const savings = totalMonthly - annual
  const percentage = Math.round((savings / totalMonthly) * 100)
  return { amount: savings, percentage }
}
