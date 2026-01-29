# Critical Fix: Mandate Authentication Required for Premium Access

**Date:** January 29, 2026  
**Severity:** 🔴 CRITICAL SECURITY ISSUE  
**Status:** ✅ FIXED  
**Commit:** `36b1ae7`

---

## 🚨 Problem Identified

Users were getting **premium tier access immediately after initiating a subscription**, WITHOUT completing Razorpay mandate setup.

### What Was Happening:

1. User clicks "Start Trial" on a premium plan
2. Backend creates subscription with:
   - `status: 'pending'`
   - `tier: 'premium'`
   - `razorpay_customer_id: NULL` (no mandate yet)
3. **BUG:** User immediately gets premium access
4. User can use premium features without ever completing payment setup

### Database Evidence:

```sql
User: d622676f... | Status: pending | Tier: premium | trial_active: false
❌ No mandate setup (razorpay_customer_id is NULL)
```

**Impact:**
- Users could access premium features without payment authorization
- Revenue loss from users who never complete mandate setup
- Violation of subscription business model

---

## 🔧 Root Cause

**File:** `src/lib/subscription-limits.ts`  
**Line:** 54 (before fix)

```typescript
// OLD CODE (VULNERABLE):
let tier: SubscriptionTier | 'free' = subscription?.tier || profile.subscription_tier || 'free'
```

**Problem:** This line immediately assigned `subscription.tier` (premium) without checking if mandate was authenticated.

---

## ✅ Solution Implemented

Added **mandate authentication check** before granting premium access.

### New Logic:

```typescript
// CRITICAL: Only grant premium tier if mandate is authenticated OR trial is active
const hasMandateSetup = subscription?.razorpay_customer_id != null
const hasTrialActive = subscription?.trial_active === true

// Determine tier: use subscription tier ONLY if mandate is set up or trial is active
let tier: SubscriptionTier | 'free' = 'free'
if (subscription && (hasMandateSetup || hasTrialActive)) {
  tier = subscription.tier
} else if (!subscription) {
  tier = profile.subscription_tier || 'free'
}
```

### Access Control Flow:

**Before Fix:**
```
User initiates subscription → tier = 'premium' ❌
```

**After Fix:**
```
User initiates subscription → tier = 'free' ✅
User completes mandate → razorpay_customer_id set → tier = 'premium' ✅
Webhook sets trial_active → tier = 'premium' ✅
```

---

## 🔒 Security Checks

Users now get premium access ONLY when:

1. **Mandate is authenticated:**
   - `razorpay_customer_id IS NOT NULL`
   - Set by webhook: `subscription.authenticated`

2. **OR Trial is active:**
   - `trial_active = true`
   - Set by webhook: `subscription.authenticated`

**Default:** Users remain on `free` tier until one of these conditions is met.

---

## 🧪 Testing

### Test Case 1: User Initiates Subscription
```
1. User clicks "Start Trial"
2. Subscription created: status='pending', tier='premium', customer_id=NULL
3. Check access: tier should be 'free' ✅
4. User should see free tier limits ✅
```

### Test Case 2: User Completes Mandate
```
1. User completes Razorpay mandate setup
2. Webhook fires: subscription.authenticated
3. Database updated: customer_id='cust_xxx', trial_active=true
4. Check access: tier should be 'premium' ✅
5. User should see trial limits ✅
```

### Test Case 3: User Abandons Mandate
```
1. User initiates subscription but closes Razorpay modal
2. Subscription remains: status='pending', customer_id=NULL
3. Check access: tier should remain 'free' ✅
4. User cannot access premium features ✅
```

---

## 📊 Impact Analysis

### Before Fix:
- **Vulnerability Window:** From subscription creation to mandate completion
- **Affected Users:** All users who initiated subscriptions
- **Risk Level:** HIGH - Unauthorized premium access

### After Fix:
- **Vulnerability:** CLOSED ✅
- **Access Control:** Enforced at mandate authentication
- **Risk Level:** NONE - Proper authorization required

---

## 🔄 Subscription Lifecycle (Corrected)

```
1. User clicks plan → Subscription created
   Status: pending
   Tier: premium (in DB)
   Access: FREE ✅ (enforced by code)

2. User completes mandate → Webhook fires
   Status: authenticated
   customer_id: cust_xxx
   trial_active: true
   Access: PREMIUM ✅ (trial limits)

3. Trial period active
   Status: authenticated/active
   trial_active: true
   Access: PREMIUM (trial limits)

4. First invoice paid → Webhook fires
   Status: active
   trial_active: false
   Access: PREMIUM (full limits)
```

---

## 🛡️ Additional Safeguards

### Database Level:
- `razorpay_customer_id` must be set for premium access
- `trial_active` flag controlled by webhooks only

### Application Level:
- `getUserSubscription()` checks both conditions
- All feature access goes through this function
- No direct tier checks without mandate validation

### Webhook Level:
- Only `subscription.authenticated` sets `trial_active=true`
- Only Razorpay webhooks can set `razorpay_customer_id`
- Signature verification prevents spoofing

---

## 📝 Related Files Modified

1. **`src/lib/subscription-limits.ts`**
   - Added mandate authentication check
   - Added `razorpay_customer_id` to query
   - Implemented conditional tier assignment

---

## ✅ Verification

Run this query to verify no users have premium without mandate:

```sql
SELECT 
  user_id,
  status,
  tier,
  trial_active,
  razorpay_customer_id,
  CASE 
    WHEN razorpay_customer_id IS NULL AND trial_active = false 
    THEN '⚠️ Should be FREE tier in app'
    ELSE '✅ Has mandate or trial'
  END as access_check
FROM subscriptions
WHERE status IN ('pending', 'authenticated', 'active')
AND tier != 'free';
```

---

## 🎯 Conclusion

**Critical security vulnerability fixed.** Users can no longer access premium features without completing Razorpay mandate setup. Access control now properly enforced at the authentication layer.

**Deployment:** Live as of commit `36b1ae7`  
**Status:** ✅ Production Ready  
**Risk:** ✅ Mitigated
