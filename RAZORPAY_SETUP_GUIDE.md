# Razorpay Subscription Plans Setup Guide

## Overview
You need to create **12 subscription plans** in Razorpay Dashboard:
- 6 plans for India (INR)
- 6 plans for Rest of World (USD)

Each region has 3 tiers × 2 billing cycles (monthly + annual)

---

## Step-by-Step Instructions

### 1. Navigate to Plans
1. Go to https://dashboard.razorpay.com/app/subscriptions
2. Click on "Plans" tab
3. Click "+ Create New Plan" button

---

## Plans to Create

### 🇮🇳 INDIA PLANS (INR)

#### Plan 1: Professional Monthly (India)
- **Plan Name:** `Professional Monthly (India)`
- **Plan ID:** (Auto-generated, save this!)
- **Billing Interval:** Monthly
- **Billing Amount:** ₹499
- **Currency:** INR
- **Description:** `15 AI customizations, 2 interview sessions, 10 templates`
- **Notes:** `tier=professional, region=india, cycle=monthly`

#### Plan 2: Professional Annual (India)
- **Plan Name:** `Professional Annual (India)`
- **Plan ID:** (Auto-generated, save this!)
- **Billing Interval:** Yearly
- **Billing Amount:** ₹4,491
- **Currency:** INR
- **Description:** `15 AI customizations, 2 interview sessions, 10 templates - Annual billing (25% off)`
- **Notes:** `tier=professional, region=india, cycle=annual`

#### Plan 3: Premium Monthly (India)
- **Plan Name:** `Premium Monthly (India)`
- **Plan ID:** (Auto-generated, save this!)
- **Billing Interval:** Monthly
- **Billing Amount:** ₹899
- **Currency:** INR
- **Description:** `75 AI customizations, 12 interview sessions, all templates, unlimited job matching`
- **Notes:** `tier=premium, region=india, cycle=monthly`

#### Plan 4: Premium Annual (India)
- **Plan Name:** `Premium Annual (India)`
- **Plan ID:** (Auto-generated, save this!)
- **Billing Interval:** Yearly
- **Billing Amount:** ₹8,091
- **Currency:** INR
- **Description:** `75 AI customizations, 12 interview sessions, all templates - Annual billing (25% off)`
- **Notes:** `tier=premium, region=india, cycle=annual`

#### Plan 5: Ultimate Monthly (India)
- **Plan Name:** `Ultimate Monthly (India)`
- **Plan ID:** (Auto-generated, save this!)
- **Billing Interval:** Monthly
- **Billing Amount:** ₹1,199
- **Currency:** INR
- **Description:** `100 AI customizations, 15 interview sessions, unlimited features, resume distribution`
- **Notes:** `tier=ultimate, region=india, cycle=monthly`

#### Plan 6: Ultimate Annual (India)
- **Plan Name:** `Ultimate Annual (India)`
- **Plan ID:** (Auto-generated, save this!)
- **Billing Interval:** Yearly
- **Billing Amount:** ₹10,791
- **Currency:** INR
- **Description:** `100 AI customizations, 15 interview sessions, unlimited features - Annual billing (25% off)`
- **Notes:** `tier=ultimate, region=india, cycle=annual`

---

### 🌍 REST OF WORLD PLANS (USD)

#### Plan 7: Professional Monthly (ROW)
- **Plan Name:** `Professional Monthly (Global)`
- **Plan ID:** (Auto-generated, save this!)
- **Billing Interval:** Monthly
- **Billing Amount:** $9.99
- **Currency:** USD
- **Description:** `15 AI customizations, 2 interview sessions, 10 templates`
- **Notes:** `tier=professional, region=row, cycle=monthly`

#### Plan 8: Professional Annual (ROW)
- **Plan Name:** `Professional Annual (Global)`
- **Plan ID:** (Auto-generated, save this!)
- **Billing Interval:** Yearly
- **Billing Amount:** $95.90
- **Currency:** USD
- **Description:** `15 AI customizations, 2 interview sessions, 10 templates - Annual billing (20% off)`
- **Notes:** `tier=professional, region=row, cycle=annual`

#### Plan 9: Premium Monthly (ROW)
- **Plan Name:** `Premium Monthly (Global)`
- **Plan ID:** (Auto-generated, save this!)
- **Billing Interval:** Monthly
- **Billing Amount:** $16.99
- **Currency:** USD
- **Description:** `75 AI customizations, 12 interview sessions, all templates, unlimited job matching`
- **Notes:** `tier=premium, region=row, cycle=monthly`

#### Plan 10: Premium Annual (ROW)
- **Plan Name:** `Premium Annual (Global)`
- **Plan ID:** (Auto-generated, save this!)
- **Billing Interval:** Yearly
- **Billing Amount:** $163.10
- **Currency:** USD
- **Description:** `75 AI customizations, 12 interview sessions, all templates - Annual billing (20% off)`
- **Notes:** `tier=premium, region=row, cycle=annual`

#### Plan 11: Ultimate Monthly (ROW)
- **Plan Name:** `Ultimate Monthly (Global)`
- **Plan ID:** (Auto-generated, save this!)
- **Billing Interval:** Monthly
- **Billing Amount:** $19.99
- **Currency:** USD
- **Description:** `100 AI customizations, 15 interview sessions, unlimited features, resume distribution`
- **Notes:** `tier=ultimate, region=row, cycle=monthly`

#### Plan 12: Ultimate Annual (ROW)
- **Plan Name:** `Ultimate Annual (Global)`
- **Plan ID:** (Auto-generated, save this!)
- **Billing Interval:** Yearly
- **Billing Amount:** $191.90
- **Currency:** USD
- **Description:** `100 AI customizations, 15 interview sessions, unlimited features - Annual billing (20% off)`
- **Notes:** `tier=ultimate, region=row, cycle=annual`

---

## After Creating Plans

### Save Plan IDs
After creating each plan, Razorpay will generate a Plan ID (format: `plan_xxxxxxxxxxxxx`).

**IMPORTANT:** Save all 12 Plan IDs in this format:

```
INDIA PLANS:
- Professional Monthly: plan_xxxxx
- Professional Annual: plan_xxxxx
- Premium Monthly: plan_xxxxx
- Premium Annual: plan_xxxxx
- Ultimate Monthly: plan_xxxxx
- Ultimate Annual: plan_xxxxx

ROW PLANS:
- Professional Monthly: plan_xxxxx
- Professional Annual: plan_xxxxx
- Premium Monthly: plan_xxxxx
- Premium Annual: plan_xxxxx
- Ultimate Monthly: plan_xxxxx
- Ultimate Annual: plan_xxxxx
```

### Update Code
Once you have all Plan IDs, update `src/lib/razorpay.ts`:

```typescript
export const RAZORPAY_PLAN_IDS = {
  india: {
    professional_monthly: 'plan_xxxxx', // Replace with actual ID
    professional_annual: 'plan_xxxxx',
    premium_monthly: 'plan_xxxxx',
    premium_annual: 'plan_xxxxx',
    ultimate_monthly: 'plan_xxxxx',
    ultimate_annual: 'plan_xxxxx',
  },
  row: {
    professional_monthly: 'plan_xxxxx',
    professional_annual: 'plan_xxxxx',
    premium_monthly: 'plan_xxxxx',
    premium_annual: 'plan_xxxxx',
    ultimate_monthly: 'plan_xxxxx',
    ultimate_annual: 'plan_xxxxx',
  },
}
```

---

## Configure Webhook

### 1. Set Up Webhook URL
1. Go to https://dashboard.razorpay.com/app/webhooks
2. Click "+ Add New Webhook"
3. **Webhook URL:** `https://www.resumeunleashed.com/api/razorpay/webhook`
4. **Active Events:** Select these:
   - `subscription.activated`
   - `subscription.charged`
   - `subscription.cancelled`
   - `subscription.completed`
   - `subscription.expired`
   - `subscription.paused`
   - `payment.failed`
5. **Alert Email:** Your email
6. Click "Create Webhook"

### 2. Save Webhook Secret
After creating the webhook, Razorpay will show you a **Webhook Secret**.

Add it to your `.env.local`:
```env
RAZORPAY_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx
```

---

## Testing

### Test Mode
1. Switch to **Test Mode** in Razorpay Dashboard
2. Create test plans with same structure but test amounts
3. Use test API keys: `rzp_test_xxxxx`
4. Test the full subscription flow

### Test Cards
Use these test cards in Test Mode:
- **Success:** 4111 1111 1111 1111
- **Failure:** 4000 0000 0000 0002
- **CVV:** Any 3 digits
- **Expiry:** Any future date

---

## Quick Checklist

- [ ] Created 6 India plans (INR)
- [ ] Created 6 ROW plans (USD)
- [ ] Saved all 12 Plan IDs
- [ ] Updated `src/lib/razorpay.ts` with Plan IDs
- [ ] Configured webhook URL
- [ ] Saved webhook secret to `.env.local`
- [ ] Tested subscription flow in Test Mode
- [ ] Switched to Live Mode
- [ ] Verified live subscription works

---

## Support

If you encounter issues:
1. Check Razorpay logs: https://dashboard.razorpay.com/app/logs
2. Check webhook logs: https://dashboard.razorpay.com/app/webhooks
3. Review Razorpay docs: https://razorpay.com/docs/payments/subscriptions/

---

## Summary

**Total Plans:** 12
**India (INR):** ₹499, ₹4,491, ₹899, ₹8,091, ₹1,199, ₹10,791
**ROW (USD):** $9.99, $95.90, $16.99, $163.10, $19.99, $191.90

**Next Steps:**
1. Create all 12 plans in Razorpay Dashboard
2. Save the Plan IDs
3. Update the code with Plan IDs
4. Configure webhook
5. Test the flow
