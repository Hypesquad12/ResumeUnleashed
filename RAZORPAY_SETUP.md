# Razorpay Setup & Troubleshooting Guide

## Current Issue: "Failed to create subscription"

### Root Cause Analysis

The subscription creation is failing because the Razorpay plan IDs in the code are **placeholder IDs** that need to be replaced with actual plan IDs from your Razorpay Dashboard.

---

## Step-by-Step Fix

### 1. **Create Subscription Plans in Razorpay Dashboard**

Go to: https://dashboard.razorpay.com/app/subscriptions/plans

Create the following plans:

#### **India Plans (INR)**

| Plan Name | Amount | Billing Cycle | Plan ID (to be copied) |
|-----------|--------|---------------|------------------------|
| Professional Monthly | ₹499 | Monthly | `plan_xxxxx` ← Copy this |
| Professional Annual | ₹4,491 | Yearly | `plan_xxxxx` ← Copy this |
| Premium Monthly | ₹899 | Monthly | `plan_xxxxx` ← Copy this |
| Premium Annual | ₹8,091 | Yearly | `plan_xxxxx` ← Copy this |
| Ultimate Monthly | ₹1,099 | Monthly | `plan_xxxxx` ← Copy this |
| Ultimate Annual | ₹9,891 | Yearly | `plan_xxxxx` ← Copy this |

#### **International Plans (INR - displayed as USD on frontend)**

| Plan Name | Amount (INR) | Billing Cycle | USD Equivalent | Plan ID |
|-----------|--------------|---------------|----------------|---------|
| Professional Monthly | ₹830 | Monthly | ~$9.99 | `plan_xxxxx` |
| Professional Annual | ₹7,970 | Yearly | ~$95.99 | `plan_xxxxx` |
| Premium Monthly | ₹1,410 | Monthly | ~$16.99 | `plan_xxxxx` |
| Premium Annual | ₹13,540 | Yearly | ~$163.99 | `plan_xxxxx` |
| Ultimate Monthly | ₹1,660 | Monthly | ~$19.99 | `plan_xxxxx` |
| Ultimate Annual | ₹15,920 | Yearly | ~$191.99 | `plan_xxxxx` |

---

### 2. **Update Plan IDs in Code**

Edit: `src/lib/razorpay.ts`

Replace the placeholder plan IDs with your actual Razorpay plan IDs:

```typescript
export const RAZORPAY_PLAN_IDS = {
  india: {
    professional_monthly: 'plan_YOUR_ACTUAL_PLAN_ID_HERE',
    professional_annual: 'plan_YOUR_ACTUAL_PLAN_ID_HERE',
    premium_monthly: 'plan_YOUR_ACTUAL_PLAN_ID_HERE',
    premium_annual: 'plan_YOUR_ACTUAL_PLAN_ID_HERE',
    ultimate_monthly: 'plan_YOUR_ACTUAL_PLAN_ID_HERE',
    ultimate_annual: 'plan_YOUR_ACTUAL_PLAN_ID_HERE',
  },
  row: {
    professional_monthly: 'plan_YOUR_ACTUAL_PLAN_ID_HERE',
    professional_annual: 'plan_YOUR_ACTUAL_PLAN_ID_HERE',
    premium_monthly: 'plan_YOUR_ACTUAL_PLAN_ID_HERE',
    premium_annual: 'plan_YOUR_ACTUAL_PLAN_ID_HERE',
    ultimate_monthly: 'plan_YOUR_ACTUAL_PLAN_ID_HERE',
    ultimate_annual: 'plan_YOUR_ACTUAL_PLAN_ID_HERE',
  },
}
```

---

### 3. **Verify Razorpay API Keys**

Check your `.env.local` file has valid keys:

```bash
RAZORPAY_KEY_ID=rzp_live_YOUR_KEY_HERE
RAZORPAY_KEY_SECRET=YOUR_SECRET_HERE
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_live_YOUR_KEY_HERE
```

**⚠️ SECURITY WARNING**: Your current keys in `.env.local` were exposed in chat logs. 
**Regenerate them immediately** at: https://dashboard.razorpay.com/app/keys

---

### 4. **Setup Webhook (Optional but Recommended)**

1. Go to: https://dashboard.razorpay.com/app/webhooks
2. Create new webhook with URL: `https://resumeunleashed.com/api/razorpay/webhook`
3. Select events:
   - `subscription.activated`
   - `subscription.charged`
   - `subscription.cancelled`
   - `subscription.completed`
4. Copy the webhook secret
5. Add to `.env.local`:
   ```bash
   RAZORPAY_WEBHOOK_SECRET=your_webhook_secret_here
   ```

---

## Testing the Fix

### Test Locally:

1. **Start dev server**:
   ```bash
   npm run dev
   ```

2. **Login to your account**

3. **Go to Pricing page**: http://localhost:3000/pricing

4. **Click "Get Started" on any plan**

5. **Expected behavior**:
   - Should redirect to Razorpay payment page
   - No "Failed to create subscription" error

### Check Logs:

If it still fails, check browser console (F12) and terminal for error messages.

---

## Common Errors & Solutions

### Error: "Razorpay plan not configured"
**Solution**: Update plan IDs in `src/lib/razorpay.ts` with actual IDs from Razorpay Dashboard

### Error: "Razorpay credentials not configured"
**Solution**: Check `.env.local` has valid `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET`

### Error: "Unauthorized"
**Solution**: User needs to be logged in. Redirect to `/signup` first.

### Error: "Failed to save subscription"
**Solution**: Check Supabase `subscriptions` table exists and RLS policies allow inserts

---

## Current Plan IDs in Code (NEED TO BE REPLACED)

These are the **placeholder IDs** currently in the code:

```
India:
- professional_monthly: plan_RyecePvMXf1Uhr
- professional_annual: plan_RyecezQGguMJKV
- premium_monthly: plan_RyecfdilZvSwQR
- premium_annual: plan_RyecgHuskKvivp
- ultimate_monthly: plan_Ryech70IbCoVES
- ultimate_annual: plan_RyechtDpt6uWcu

ROW:
- professional_monthly: plan_RyeciXNJ0by01K
- professional_annual: plan_RyecjJrhRaOC2C
- premium_monthly: plan_Ryecjsb29rR3AA
- premium_annual: plan_Ryecka1EcRkGXF
- ultimate_monthly: plan_Ryecl9puJyk5Jt
- ultimate_annual: plan_Ryeclh4JoPMp6T
```

**These IDs won't work** - they need to be replaced with your actual plan IDs.

---

## Next Steps

1. ✅ Create plans in Razorpay Dashboard
2. ✅ Copy the plan IDs
3. ✅ Update `src/lib/razorpay.ts` with actual plan IDs
4. ✅ Regenerate API keys (security)
5. ✅ Test subscription flow
6. ✅ Setup webhook for production

---

## Support

If you continue to have issues:
1. Check Razorpay Dashboard logs: https://dashboard.razorpay.com/app/logs
2. Check browser console for errors (F12)
3. Check server logs in terminal
4. Verify all environment variables are set correctly
