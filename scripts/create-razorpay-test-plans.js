const Razorpay = require('razorpay');
require('dotenv').config({ path: '.env.local' });

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// India pricing from pricing-config.ts
const plans = [
  {
    name: 'Professional Monthly',
    period: 'monthly',
    interval: 1,
    amount: 49900, // ₹499 in paise
    tier: 'professional',
    billing: 'monthly',
  },
  {
    name: 'Professional Annual',
    period: 'yearly',
    interval: 1,
    amount: 449100, // ₹4,491 in paise
    tier: 'professional',
    billing: 'annual',
  },
  {
    name: 'Premium Monthly',
    period: 'monthly',
    interval: 1,
    amount: 79900, // ₹799 in paise
    tier: 'premium',
    billing: 'monthly',
  },
  {
    name: 'Premium Annual',
    period: 'yearly',
    interval: 1,
    amount: 719100, // ₹7,191 in paise
    tier: 'premium',
    billing: 'annual',
  },
  {
    name: 'Ultimate Monthly',
    period: 'monthly',
    interval: 1,
    amount: 109900, // ₹1,099 in paise
    tier: 'ultimate',
    billing: 'monthly',
  },
  {
    name: 'Ultimate Annual',
    period: 'yearly',
    interval: 1,
    amount: 989100, // ₹9,891 in paise
    tier: 'ultimate',
    billing: 'annual',
  },
];

async function createPlans() {
  console.log('Creating Razorpay test plans...\n');
  
  const planIds = {};
  
  for (const planConfig of plans) {
    try {
      const plan = await razorpay.plans.create({
        period: planConfig.period,
        interval: planConfig.interval,
        item: {
          name: planConfig.name,
          amount: planConfig.amount,
          currency: 'INR',
          description: `${planConfig.name} subscription plan`,
        },
        notes: {
          tier: planConfig.tier,
          billing_cycle: planConfig.billing,
        },
      });
      
      const key = `${planConfig.tier}_${planConfig.billing}`;
      planIds[key] = plan.id;
      
      console.log(`✅ Created: ${planConfig.name}`);
      console.log(`   Plan ID: ${plan.id}`);
      console.log(`   Amount: ₹${planConfig.amount / 100}\n`);
    } catch (error) {
      console.error(`❌ Failed to create ${planConfig.name}:`, error.message);
    }
  }
  
  console.log('\n--- Copy this to src/lib/razorpay.ts ---\n');
  console.log('export const RAZORPAY_PLAN_IDS = {');
  console.log('  india: {');
  console.log(`    professional_monthly: '${planIds.professional_monthly}',`);
  console.log(`    professional_annual: '${planIds.professional_annual}',`);
  console.log(`    premium_monthly: '${planIds.premium_monthly}',`);
  console.log(`    premium_annual: '${planIds.premium_annual}',`);
  console.log(`    ultimate_monthly: '${planIds.ultimate_monthly}',`);
  console.log(`    ultimate_annual: '${planIds.ultimate_annual}',`);
  console.log('  },');
  console.log('};');
}

createPlans().catch(console.error);
