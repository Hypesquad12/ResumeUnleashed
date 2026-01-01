export type SubscriptionTier = 'free' | 'professional' | 'premium' | 'ultimate'
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
    id: 'india-free',
    name: 'Starter',
    tier: 'free',
    region: 'india',
    currency: 'INR',
    priceMonthly: 0,
    priceAnnual: 0,
    features: {
      templates: 1,
      aiCustomization: false,
      atsOptimization: false,
      downloads: 'pdf_watermark',
      jobMatching: 'none',
      interviewPrep: false,
      visitingCards: 0,
      support: 'Email (72hr response)',
    },
    limits: {
      resumes: 1,
      customizations: 0,
      interviews: 0,
      jobMatching: 0,
    },
  },
  {
    id: 'india-professional',
    name: 'Professional',
    tier: 'professional',
    region: 'india',
    currency: 'INR',
    priceMonthly: 499,
    priceAnnual: 4491,
    features: {
      templates: 10,
      aiCustomization: true,
      atsOptimization: true,
      downloads: 'pdf',
      jobMatching: 'basic',
      interviewPrep: true,
      visitingCards: 1,
      support: 'Email (48hr response)',
    },
    limits: {
      resumes: 5,
      customizations: 15,
      interviews: 2,
      jobMatching: 10,
    },
  },
  {
    id: 'india-premium',
    name: 'Premium',
    tier: 'premium',
    region: 'india',
    currency: 'INR',
    priceMonthly: 899,
    priceAnnual: 8091,
    popular: true,
    badge: 'BEST VALUE',
    features: {
      templates: 'all',
      aiCustomization: true,
      atsOptimization: 'advanced',
      downloads: 'all_formats',
      jobMatching: 'unlimited',
      interviewPrep: true,
      visitingCards: 10,
      analytics: true,
      linkedinOptimization: true,
      coverLetter: true,
      support: 'Priority (24hr response)',
    },
    limits: {
      resumes: 15,
      customizations: 75,
      interviews: 12,
      jobMatching: -1,
      coverLetters: 20,
    },
  },
  {
    id: 'india-ultimate',
    name: 'Ultimate',
    tier: 'ultimate',
    region: 'india',
    currency: 'INR',
    priceMonthly: 1199,
    priceAnnual: 10791,
    features: {
      templates: 'all',
      aiCustomization: true,
      atsOptimization: 'advanced',
      downloads: 'all_formats',
      jobMatching: 'unlimited',
      interviewPrep: 'unlimited',
      visitingCards: 'unlimited',
      analytics: true,
      linkedinOptimization: true,
      coverLetter: true,
      resumeDistribution: true,
      support: 'Priority (12hr response)',
    },
    limits: {
      resumes: -1,
      customizations: 100,
      interviews: 15,
      jobMatching: -1,
      coverLetters: 30,
    },
  },
]

// Rest of World Pricing (USD)
export const rowPricing: PricingPlan[] = [
  {
    id: 'row-free',
    name: 'Starter',
    tier: 'free',
    region: 'row',
    currency: 'USD',
    priceMonthly: 0,
    priceAnnual: 0,
    features: {
      templates: 1,
      aiCustomization: false,
      atsOptimization: false,
      downloads: 'pdf_watermark',
      jobMatching: 'none',
      interviewPrep: false,
      visitingCards: 0,
      support: 'Email (72hr response)',
    },
    limits: {
      resumes: 1,
      customizations: 0,
      interviews: 0,
      jobMatching: 0,
    },
  },
  {
    id: 'row-professional',
    name: 'Professional',
    tier: 'professional',
    region: 'row',
    currency: 'USD',
    priceMonthly: 9.99,
    priceAnnual: 95.90,
    features: {
      templates: 10,
      aiCustomization: true,
      atsOptimization: true,
      downloads: 'pdf',
      jobMatching: 'basic',
      interviewPrep: true,
      visitingCards: 1,
      support: 'Email (48hr response)',
    },
    limits: {
      resumes: 5,
      customizations: 15,
      interviews: 2,
      jobMatching: 10,
    },
  },
  {
    id: 'row-premium',
    name: 'Premium',
    tier: 'premium',
    region: 'row',
    currency: 'USD',
    priceMonthly: 16.99,
    priceAnnual: 163.10,
    popular: true,
    badge: 'BEST VALUE',
    features: {
      templates: 'all',
      aiCustomization: true,
      atsOptimization: 'advanced',
      downloads: 'all_formats',
      jobMatching: 'unlimited',
      interviewPrep: true,
      visitingCards: 10,
      analytics: true,
      linkedinOptimization: true,
      coverLetter: true,
      support: 'Priority (24hr response)',
    },
    limits: {
      resumes: 15,
      customizations: 75,
      interviews: 12,
      jobMatching: -1,
      coverLetters: 20,
    },
  },
  {
    id: 'row-ultimate',
    name: 'Ultimate',
    tier: 'ultimate',
    region: 'row',
    currency: 'USD',
    priceMonthly: 19.99,
    priceAnnual: 191.90,
    features: {
      templates: 'all',
      aiCustomization: true,
      atsOptimization: 'advanced',
      downloads: 'all_formats',
      jobMatching: 'unlimited',
      interviewPrep: 'unlimited',
      visitingCards: 'unlimited',
      analytics: true,
      linkedinOptimization: true,
      coverLetter: true,
      resumeDistribution: true,
      support: 'Priority (12hr response)',
    },
    limits: {
      resumes: -1,
      customizations: 100,
      interviews: 15,
      jobMatching: -1,
      coverLetters: 30,
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
