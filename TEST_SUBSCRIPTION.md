# Testing Subscription Flow - Debug Guide

## Current Status
Local dev server is running at http://localhost:3000

## Steps to Test Locally

1. **Open the local site**: Click the browser preview button above or go to http://localhost:3000

2. **Navigate to pricing**: http://localhost:3000/pricing

3. **Login first**: 
   - If not logged in, go to http://localhost:3000/login
   - Or signup at http://localhost:3000/signup

4. **Select a plan**:
   - Click "Get Started" on Professional, Premium, or Ultimate plan
   - Should redirect to Razorpay payment page

## What to Check

### Browser Console (F12)
Look for errors in the console when clicking "Get Started"

### Network Tab (F12 → Network)
1. Filter by "create-subscription"
2. Click "Get Started" on a plan
3. Check the request:
   - **Status**: Should be 200 (not 500)
   - **Response**: Should have `shortUrl` field
   - **Payload**: Should have planId, billingCycle, region, tier

### Expected Flow
```
Click "Get Started" 
  → POST /api/razorpay/create-subscription
  → Response: { subscriptionId, customerId, shortUrl }
  → Redirect to shortUrl (Razorpay payment page)
```

## Common Issues

### Issue 1: "Failed to create subscription"
**Check**: Browser console error message
**Likely cause**: API endpoint returning 500 error

### Issue 2: Not redirecting
**Check**: Network tab response
**Likely cause**: No `shortUrl` in response

### Issue 3: "Unauthorized"
**Check**: User is logged in
**Solution**: Login first at /login

## Debug the API Endpoint

### Test API directly:
```bash
# In a new terminal
curl -X POST http://localhost:3000/api/razorpay/create-subscription \
  -H "Content-Type: application/json" \
  -d '{
    "planId": "india-professional",
    "billingCycle": "monthly",
    "region": "india",
    "tier": "professional"
  }'
```

Expected response:
```json
{
  "subscriptionId": "sub_xxxxx",
  "customerId": "cust_xxxxx",
  "shortUrl": "https://rzp.io/l/xxxxx"
}
```

## Check Server Logs

Watch the terminal where `npm run dev` is running for:
- Razorpay API errors
- Database errors
- Missing environment variables

## Verify Environment Variables

Check .env.local has:
- RAZORPAY_KEY_ID
- RAZORPAY_KEY_SECRET
- NEXT_PUBLIC_RAZORPAY_KEY_ID
- NEXT_PUBLIC_SUPABASE_URL
- NEXT_PUBLIC_SUPABASE_ANON_KEY

## Next Steps

1. Test locally first (http://localhost:3000)
2. If local works, issue is with Vercel deployment
3. If local doesn't work, debug the API endpoint
