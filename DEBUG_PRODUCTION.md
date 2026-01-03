# Production Debugging Checklist

## Issue: Subscription creation still failing on production after deployment

## Steps to Debug:

### 1. Check Vercel Deployment Status
- Go to: https://vercel.com/anirudhs-projects-5362dc60/resume-builder
- Verify latest deployment shows "Ready" (commit: 1844687)
- Check deployment time - should be within last 5 minutes

### 2. Check Vercel Function Logs
1. Go to: https://vercel.com/anirudhs-projects-5362dc60/resume-builder
2. Click **"Logs"** tab (main navigation)
3. Filter by: `/api/razorpay/create-subscription`
4. Look for the error message

**What to look for:**
- Database error (same as before?)
- Missing environment variables
- Razorpay API error
- Different error than local?

### 3. Verify Environment Variables in Vercel
Go to: https://vercel.com/anirudhs-projects-5362dc60/resume-builder/settings/environment-variables

**Required variables** (7 total):
- ✅ NEXT_PUBLIC_SUPABASE_URL
- ✅ NEXT_PUBLIC_SUPABASE_ANON_KEY
- ✅ RAZORPAY_KEY_ID
- ✅ RAZORPAY_KEY_SECRET
- ✅ NEXT_PUBLIC_RAZORPAY_KEY_ID
- ✅ OPENAI_API_KEY
- ✅ NEXT_PUBLIC_APP_URL

### 4. Test Local vs Production

**Local (should work):**
- http://localhost:3000/pricing
- Click "Get Started"
- Should redirect to Razorpay ✅

**Production (currently failing):**
- https://www.resumeunleashed.com/pricing
- Click "Get Started"
- Still shows "Failed to create subscription" ❌

### 5. Common Production Issues

**Issue 1: Cache not cleared**
- Hard refresh: Cmd+Shift+R (Mac) or Ctrl+Shift+F5 (Windows)
- Clear browser cache completely
- Try incognito/private window

**Issue 2: Wrong deployment active**
- Check Vercel deployment list
- Ensure commit 1844687 is the active deployment
- Look for "Current" badge on deployment

**Issue 3: Environment variables not applied**
- Environment variables only apply to NEW deployments
- If you added env vars AFTER deployment, need to redeploy
- Solution: Trigger new deployment

**Issue 4: Build cache issue**
- Vercel might be using cached build
- Solution: Redeploy WITHOUT build cache

**Issue 5: Different error than local**
- Local: Works ✅
- Production: Fails ❌
- Indicates environment-specific issue
- Check production logs for specific error

### 6. Quick Fixes

**Fix 1: Force Fresh Deployment**
```bash
# In terminal
cd "/Users/anirudhlolla/Desktop/resume builder/resume-builder"
git commit --allow-empty -m "Force fresh deployment"
git push
```

**Fix 2: Clear All Caches**
1. Vercel Dashboard → Project Settings → Clear Cache
2. Browser: Clear site data for www.resumeunleashed.com
3. Hard refresh (Cmd+Shift+R)

**Fix 3: Check Build Logs**
1. Vercel → Latest Deployment → Build Logs
2. Look for any errors during build
3. Check if environment variables are being loaded

### 7. Debugging Steps in Order

1. ✅ Check latest deployment is active
2. ✅ Check Vercel function logs for error
3. ✅ Compare error with local development
4. ✅ Verify environment variables
5. ✅ Clear all caches and test
6. ✅ Trigger fresh deployment if needed

## Expected Behavior After Fix:

1. User clicks "Get Started" on pricing page
2. API creates subscription in Razorpay ✅
3. API saves subscription to database ✅
4. API returns shortUrl ✅
5. User redirected to Razorpay payment page ✅

## Current Behavior:

1. User clicks "Get Started" on pricing page
2. Shows "Failed to create subscription" alert ❌
3. No redirect happens ❌

## Next Steps:

1. **Check Vercel logs RIGHT NOW** - see what error is happening in production
2. **Compare with local** - local should work, production fails
3. **Identify the difference** - what's different between local and production?
4. **Fix the production-specific issue**
