/**
 * Script to automatically create all Razorpay subscription plans
 * Run with: npx tsx scripts/create-razorpay-plans.ts
 */

import Razorpay from 'razorpay'
import * as dotenv from 'dotenv'
import * as path from 'path'

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(__dirname, '../.env.local') })

// Validate credentials
if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
  console.error('❌ Error: RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET must be set in .env.local')
  process.exit(1)
}

// Initialize Razorpay with your credentials
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
})

interface PlanConfig {
  name: string
  amount: number
  currency: 'INR' | 'USD'
  period: 'monthly' | 'yearly'
  interval: number
  description: string
  notes: {
    tier: string
    region: string
    cycle: string
  }
}

const plans: PlanConfig[] = [
  // India Plans (INR)
  {
    name: 'Professional Monthly (India)',
    amount: 49900, // ₹499 in paise
    currency: 'INR',
    period: 'monthly',
    interval: 1,
    description: '15 AI customizations, 2 interview sessions, 10 templates',
    notes: {
      tier: 'professional',
      region: 'india',
      cycle: 'monthly',
    },
  },
  {
    name: 'Professional Annual (India)',
    amount: 449100, // ₹4,491 in paise
    currency: 'INR',
    period: 'yearly',
    interval: 1,
    description: '15 AI customizations, 2 interview sessions, 10 templates - Annual billing (25% off)',
    notes: {
      tier: 'professional',
      region: 'india',
      cycle: 'annual',
    },
  },
  {
    name: 'Premium Monthly (India)',
    amount: 89900, // ₹899 in paise
    currency: 'INR',
    period: 'monthly',
    interval: 1,
    description: '75 AI customizations, 12 interview sessions, all templates, unlimited job matching',
    notes: {
      tier: 'premium',
      region: 'india',
      cycle: 'monthly',
    },
  },
  {
    name: 'Premium Annual (India)',
    amount: 809100, // ₹8,091 in paise
    currency: 'INR',
    period: 'yearly',
    interval: 1,
    description: '75 AI customizations, 12 interview sessions, all templates - Annual billing (25% off)',
    notes: {
      tier: 'premium',
      region: 'india',
      cycle: 'annual',
    },
  },
  {
    name: 'Ultimate Monthly (India)',
    amount: 119900, // ₹1,199 in paise
    currency: 'INR',
    period: 'monthly',
    interval: 1,
    description: '100 AI customizations, 15 interview sessions, unlimited features, resume distribution',
    notes: {
      tier: 'ultimate',
      region: 'india',
      cycle: 'monthly',
    },
  },
  {
    name: 'Ultimate Annual (India)',
    amount: 1079100, // ₹10,791 in paise
    currency: 'INR',
    period: 'yearly',
    interval: 1,
    description: '100 AI customizations, 15 interview sessions, unlimited features - Annual billing (25% off)',
    notes: {
      tier: 'ultimate',
      region: 'india',
      cycle: 'annual',
    },
  },

  // Rest of World Plans (INR - Razorpay only supports INR)
  // Frontend will display USD equivalent: ₹83 ≈ $1
  {
    name: 'Professional Monthly (Global)',
    amount: 83000, // ₹830 (≈$10) in paise
    currency: 'INR',
    period: 'monthly',
    interval: 1,
    description: '15 AI customizations, 2 interview sessions, 10 templates - International pricing',
    notes: {
      tier: 'professional',
      region: 'row',
      cycle: 'monthly',
    },
  },
  {
    name: 'Professional Annual (Global)',
    amount: 797000, // ₹7,970 (≈$96) in paise
    currency: 'INR',
    period: 'yearly',
    interval: 1,
    description: '15 AI customizations, 2 interview sessions, 10 templates - Annual billing (20% off)',
    notes: {
      tier: 'professional',
      region: 'row',
      cycle: 'annual',
    },
  },
  {
    name: 'Premium Monthly (Global)',
    amount: 141000, // ₹1,410 (≈$17) in paise
    currency: 'INR',
    period: 'monthly',
    interval: 1,
    description: '75 AI customizations, 12 interview sessions, all templates, unlimited job matching',
    notes: {
      tier: 'premium',
      region: 'row',
      cycle: 'monthly',
    },
  },
  {
    name: 'Premium Annual (Global)',
    amount: 1354000, // ₹13,540 (≈$163) in paise
    currency: 'INR',
    period: 'yearly',
    interval: 1,
    description: '75 AI customizations, 12 interview sessions, all templates - Annual billing (20% off)',
    notes: {
      tier: 'premium',
      region: 'row',
      cycle: 'annual',
    },
  },
  {
    name: 'Ultimate Monthly (Global)',
    amount: 166000, // ₹1,660 (≈$20) in paise
    currency: 'INR',
    period: 'monthly',
    interval: 1,
    description: '100 AI customizations, 15 interview sessions, unlimited features, resume distribution',
    notes: {
      tier: 'ultimate',
      region: 'row',
      cycle: 'monthly',
    },
  },
  {
    name: 'Ultimate Annual (Global)',
    amount: 1592000, // ₹15,920 (≈$192) in paise
    currency: 'INR',
    period: 'yearly',
    interval: 1,
    description: '100 AI customizations, 15 interview sessions, unlimited features - Annual billing (20% off)',
    notes: {
      tier: 'ultimate',
      region: 'row',
      cycle: 'annual',
    },
  },
]

async function createPlans() {
  console.log('🚀 Creating Razorpay subscription plans...\n')

  const createdPlans: Record<string, Record<string, string>> = {
    india: {},
    row: {},
  }

  for (const planConfig of plans) {
    try {
      console.log(`Creating: ${planConfig.name}...`)

      const plan = await razorpay.plans.create({
        period: planConfig.period,
        interval: planConfig.interval,
        item: {
          name: planConfig.name,
          amount: planConfig.amount,
          currency: planConfig.currency,
          description: planConfig.description,
        },
        notes: planConfig.notes,
      })

      console.log(`✅ Created: ${plan.id}`)
      console.log(`   Amount: ${planConfig.currency} ${planConfig.amount / (planConfig.currency === 'INR' ? 100 : 100)}`)
      console.log(`   Period: ${planConfig.period}\n`)

      // Store plan ID
      const region = planConfig.notes.region
      const key = `${planConfig.notes.tier}_${planConfig.notes.cycle}`
      createdPlans[region][key] = plan.id
    } catch (error: any) {
      console.error(`❌ Error creating ${planConfig.name}:`, error.error?.description || error.message)
    }
  }

  // Output the plan IDs in the format needed for razorpay.ts
  console.log('\n' + '='.repeat(80))
  console.log('📋 PLAN IDS - Copy this to src/lib/razorpay.ts')
  console.log('='.repeat(80) + '\n')

  console.log('export const RAZORPAY_PLAN_IDS = {')
  console.log('  india: {')
  console.log(`    professional_monthly: '${createdPlans.india.professional_monthly || 'plan_xxxxx'}',`)
  console.log(`    professional_annual: '${createdPlans.india.professional_annual || 'plan_xxxxx'}',`)
  console.log(`    premium_monthly: '${createdPlans.india.premium_monthly || 'plan_xxxxx'}',`)
  console.log(`    premium_annual: '${createdPlans.india.premium_annual || 'plan_xxxxx'}',`)
  console.log(`    ultimate_monthly: '${createdPlans.india.ultimate_monthly || 'plan_xxxxx'}',`)
  console.log(`    ultimate_annual: '${createdPlans.india.ultimate_annual || 'plan_xxxxx'}',`)
  console.log('  },')
  console.log('  row: {')
  console.log(`    professional_monthly: '${createdPlans.row.professional_monthly || 'plan_xxxxx'}',`)
  console.log(`    professional_annual: '${createdPlans.row.professional_annual || 'plan_xxxxx'}',`)
  console.log(`    premium_monthly: '${createdPlans.row.premium_monthly || 'plan_xxxxx'}',`)
  console.log(`    premium_annual: '${createdPlans.row.premium_annual || 'plan_xxxxx'}',`)
  console.log(`    ultimate_monthly: '${createdPlans.row.ultimate_monthly || 'plan_xxxxx'}',`)
  console.log(`    ultimate_annual: '${createdPlans.row.ultimate_annual || 'plan_xxxxx'}',`)
  console.log('  },')
  console.log('}')

  console.log('\n' + '='.repeat(80))
  console.log('✅ All plans created successfully!')
  console.log('='.repeat(80))
}

// Run the script
createPlans().catch((error) => {
  console.error('Fatal error:', error)
  process.exit(1)
})
