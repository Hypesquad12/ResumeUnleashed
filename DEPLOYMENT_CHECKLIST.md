# Deployment Checklist - Fix "Failed to create subscription" Error

## Issue
The subscription creation is failing with a 500 Internal Server Error on your production Vercel deployment.

## Root Cause
Looking at your Vercel logs, the error is happening because:
1. **Environment variables are missing or incorrect in Vercel**
2. **Latest code changes with updated plan IDs are not deployed yet**

---

## ✅ **Step-by-Step Fix**

### **1. Add Environment Variables to Vercel**

Go to: https://vercel.com/anirudhs-projects-5362dc60/resume-builder/settings/environment-variables

Add these **exact** environment variables:

#### **Supabase Variables:**
```
NEXT_PUBLIC_SUPABASE_URL=https://ligrkhpksdotctcwrxfn.supabase.co
```
```
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxpZ3JraHBrc2RvdGN0Y3dyeGZuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUyMDgwNDUsImV4cCI6MjA4MDc4NDA0NX0.P0gHlxbP2p5DErJhtfdOS-9ITo0LOYQ-HZk78ux3Xlo
```

#### **Razorpay Variables:**
```
RAZORPAY_KEY_ID=rzp_live_RyeTAWzrpEXj4A
```
```
RAZORPAY_KEY_SECRET=bL4F58zf1uxPusz6qnkmS9ZE
```
```
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_live_RyeTAWzrpEXj4A
```

#### **OpenAI Variable:**
```
OPENAI_API_KEY=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
```

#### **App URL:**
```
NEXT_PUBLIC_APP_URL=https://www.resumeunleashed.com
```

**Important**: 
- Select **"Production"** environment for all variables
- Click **"Save"** after adding each variable

---

### **2. Trigger New Deployment**

After adding environment variables, you need to redeploy:

#### **Option A: Via Vercel Dashboard**
1. Go to: https://vercel.com/anirudhs-projects-5362dc60/resume-builder
2. Click **"Deployments"** tab
3. Click **"Redeploy"** on the latest deployment
4. Select **"Use existing Build Cache"** → **NO** (uncheck it)
5. Click **"Redeploy"**

#### **Option B: Via Git Push** (Recommended)
```bash
# Make a small change to trigger deployment
git commit --allow-empty -m "Trigger deployment with updated plan IDs"
git push
```

---

### **3. Wait for Deployment to Complete**

1. Go to: https://vercel.com/anirudhs-projects-5362dc60/resume-builder
2. Watch the deployment progress
3. Wait for **"Ready"** status (usually 2-3 minutes)

---

### **4. Test Subscription Flow**

After deployment completes:

1. **Clear browser cache** (Cmd+Shift+R / Ctrl+Shift+F5)
2. Go to: https://www.resumeunleashed.com/pricing
3. **Login** to your account
4. Click **"Get Started"** on any plan
5. Should redirect to Razorpay payment page ✅

---

## **Verification Steps**

### Check Environment Variables in Vercel:
1. Go to: https://vercel.com/anirudhs-projects-5362dc60/resume-builder/settings/environment-variables
2. Verify all 7 variables are listed
3. Ensure they're set for **"Production"** environment

### Check Deployment Logs:
1. Go to: https://vercel.com/anirudhs-projects-5362dc60/resume-builder
2. Click on latest deployment
3. Click **"Logs"** tab
4. Look for any errors during build

### Check Function Logs (After Testing):
1. Go to: https://vercel.com/anirudhs-projects-5362dc60/resume-builder
2. Click **"Logs"** tab (main navigation)
3. Filter by: `/api/razorpay/create-subscription`
4. Should see successful requests (200 status)

---

## **Common Issues & Solutions**

### Issue: "Razorpay credentials not configured"
**Solution**: Add `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` to Vercel environment variables

### Issue: "Razorpay plan not configured"
**Solution**: Latest code with updated plan IDs not deployed yet. Trigger new deployment.

### Issue: "Unauthorized"
**Solution**: User not logged in. Redirect to `/signup` first.

### Issue: Environment variables not working
**Solution**: 
1. Delete and re-add the variables
2. Make sure to select "Production" environment
3. Trigger a new deployment (not just redeploy)

---

## **Security Note**

⚠️ **IMPORTANT**: Your Razorpay API keys were exposed in our chat. After fixing the subscription issue, you should:

1. Go to: https://dashboard.razorpay.com/app/keys
2. Click **"Regenerate Key Secret"**
3. Update both `.env.local` AND Vercel environment variables with new keys
4. Redeploy

---

## **Quick Reference**

| What | Where |
|------|-------|
| Vercel Project | https://vercel.com/anirudhs-projects-5362dc60/resume-builder |
| Environment Variables | Settings → Environment Variables |
| Deployment Logs | Deployments → [Latest] → Logs |
| Function Logs | Logs tab (main navigation) |
| Razorpay Dashboard | https://dashboard.razorpay.com |

---

## **Expected Result**

After completing all steps:
- ✅ Subscription creation works
- ✅ Redirects to Razorpay payment page
- ✅ No "Failed to create subscription" error
- ✅ Vercel logs show 200 status for `/api/razorpay/create-subscription`
