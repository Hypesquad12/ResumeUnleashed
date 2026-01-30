# Razorpay Integration - Issues & Fixes Plan

**Audit Date:** January 29, 2026  
**Auditor:** Razorpay Integration Expert  
**Status:** 11 Issues Found (4 Critical, 7 Important)

---

## 🔴 CRITICAL ISSUES (Must Fix Immediately)

### Issue #1: Webhook - Trial Ends Too Early
**File:** `supabase/functions/razorpay-webhook/index.ts`  
**Line:** 119  
**Severity:** 🔴 CRITICAL

**Problem:**
```typescript
case 'subscription.activated': {
  await supabase
    .from('subscriptions')
    .update({
      status: 'active',
      trial_active: false, // ❌ WRONG - Ends trial too early
    })
}
```

**Why It's Wrong:**
- `subscription.activated` fires when billing cycle **starts**
- For trial users, trial is still active at this point
- Trial should only end when **first invoice is paid**

**Official Razorpay Flow:**
1. `subscription.authenticated` → Mandate setup complete, trial starts
2. `subscription.activated` → Billing cycle starts (trial still active)
3. `invoice.paid` → First charge successful, **trial ends here**

**Fix:**
```typescript
case 'subscription.activated': {
  const subscription = event.payload.subscription.entity
  const userId = subscription.notes?.user_id
  if (!userId) break

  // Don't change trial_active - it remains true during trial
  // Trial ends when first invoice is paid
  await supabase
    .from('subscriptions')
    .update({
      status: 'active',
      current_period_start: subscription.current_start 
        ? new Date(subscription.current_start * 1000).toISOString() 
        : null,
      current_period_end: subscription.current_end 
        ? new Date(subscription.current_end * 1000).toISOString() 
        : null,
    })
    .eq('user_id', userId)
}
```

**Impact:** High - Users lose trial access prematurely

---

### Issue #2: Cancel Subscription - Immediate Instead of End-of-Cycle
**File:** `src/app/api/razorpay/cancel-subscription/route.ts`  
**Line:** 22  
**Severity:** 🔴 CRITICAL

**Problem:**
```typescript
// Comment says "end of billing period" but code does immediate
const cancelledSubscription = await razorpay.subscriptions.cancel(subscriptionId, false)
```

**Why It's Wrong:**
- `false` = immediate cancellation (user loses access now)
- `true` = cancel at end of cycle (user keeps access until period end)
- Comment contradicts code
- Poor user experience

**Official Razorpay Best Practice:**
- Always use end-of-cycle cancellation for better UX
- User maintains access until `current_period_end`
- No refunds needed

**Fix:**
```typescript
// Cancel at end of cycle (true = cancel_at_cycle_end)
const cancelledSubscription = await razorpay.subscriptions.cancel(subscriptionId, true)
```

**Impact:** High - Users lose paid access immediately instead of at period end

---

### Issue #3: Create Subscription - Wrong Trial Expiry Calculation
**File:** `src/app/api/razorpay/create-subscription/route.ts`  
**Line:** 200  
**Severity:** 🔴 CRITICAL

**Problem:**
```typescript
const trialExpiresAt = trialDays > 0 
  ? new Date(Date.now() + (trialDays * 24 * 60 * 60 * 1000)) 
  : null
```

**Why It's Wrong:**
- Calculates trial expiry from NOW
- But trial period is between **authentication** and **start_at**
- Trial expires AT `start_at` date, not NOW + 7 days

**Official Razorpay Behavior:**
- Trial period = time between mandate authentication and `start_at`
- Trial expires exactly at `start_at` timestamp

**Fix:**
```typescript
const trialExpiresAt = trialDays > 0 ? startAt : null
```

**Impact:** High - Incorrect trial end date shown to users

---

### Issue #4: Create Subscription - Wrong Period Dates
**File:** `src/app/api/razorpay/create-subscription/route.ts`  
**Lines:** 190-196  
**Severity:** 🔴 CRITICAL

**Problem:**
```typescript
const periodStart = new Date() // ❌ NOW
const periodEnd = new Date()   // ❌ NOW + 1 month/year
```

**Why It's Wrong:**
- Billing doesn't start NOW
- Billing starts at `start_at` (after trial)
- Period dates should reflect actual billing period

**Official Razorpay Behavior:**
- `current_period_start` = `start_at` (when billing actually begins)
- `current_period_end` = `start_at + 1 month/year`

**Fix:**
```typescript
const periodStart = startAt
const periodEnd = new Date(startAt)
if (billingCycle === 'annual') {
  periodEnd.setFullYear(periodEnd.getFullYear() + 1)
} else {
  periodEnd.setMonth(periodEnd.getMonth() + 1)
}
```

**Impact:** High - Incorrect billing dates in database and UI

---

## 🟡 IMPORTANT ISSUES (Should Fix)

### Issue #5: Webhook - Missing `subscription.pending` Handler
**File:** `supabase/functions/razorpay-webhook/index.ts`  
**Severity:** 🟡 IMPORTANT

**Problem:** No handler for `subscription.pending` event

**Why It Matters:**
- Fires when payment fails and retries begin
- Critical for notifying users of payment issues

**Fix:**
```typescript
case 'subscription.pending': {
  const subscription = event.payload.subscription.entity
  const userId = subscription.notes?.user_id
  if (!userId) break

  await supabase
    .from('subscriptions')
    .update({ 
      status: 'pending',
      current_period_start: subscription.current_start 
        ? new Date(subscription.current_start * 1000).toISOString() 
        : null,
      current_period_end: subscription.current_end 
        ? new Date(subscription.current_end * 1000).toISOString() 
        : null,
    })
    .eq('user_id', userId)

  console.log(`Subscription pending for user ${userId}`)
  // TODO: Send email notification
  break
}
```

**Impact:** Medium - Users not notified of payment failures

---

### Issue #6: Webhook - Missing `subscription.resumed` Handler
**File:** `supabase/functions/razorpay-webhook/index.ts`  
**Severity:** 🟡 IMPORTANT

**Problem:** No handler for `subscription.resumed` event

**Fix:**
```typescript
case 'subscription.resumed': {
  const subscription = event.payload.subscription.entity
  const userId = subscription.notes?.user_id
  if (!userId) break

  await supabase
    .from('subscriptions')
    .update({ status: 'active' })
    .eq('user_id', userId)
  
  console.log(`Subscription resumed for user ${userId}`)
  break
}
```

**Impact:** Low - Paused subscriptions can't be properly resumed

---

### Issue #7: Webhook - Missing Period Updates in `subscription.authenticated`
**File:** `supabase/functions/razorpay-webhook/index.ts`  
**Lines:** 88-107  
**Severity:** 🟡 IMPORTANT

**Problem:** Doesn't update period dates from Razorpay response

**Fix:**
```typescript
case 'subscription.authenticated': {
  const subscription = event.payload.subscription.entity
  const userId = subscription.notes?.user_id
  if (!userId) break

  const trialDays = parseInt(subscription.notes?.trial_days || '0')
  
  await supabase
    .from('subscriptions')
    .update({
      status: 'authenticated',
      razorpay_subscription_id: subscription.id,
      razorpay_customer_id: subscription.customer_id,
      trial_active: trialDays > 0,
      current_period_start: subscription.current_start 
        ? new Date(subscription.current_start * 1000).toISOString() 
        : null,
      current_period_end: subscription.current_end 
        ? new Date(subscription.current_end * 1000).toISOString() 
        : null,
      start_at: subscription.start_at 
        ? new Date(subscription.start_at * 1000).toISOString() 
        : null,
    })
    .eq('user_id', userId)
}
```

**Impact:** Medium - Database dates may not match Razorpay

---

### Issue #8: Webhook - Missing Period Updates in `invoice.paid`
**File:** `supabase/functions/razorpay-webhook/index.ts`  
**Lines:** 127-145  
**Severity:** 🟡 IMPORTANT

**Problem:** Only updates `next_billing_at`, missing period dates

**Fix:**
```typescript
case 'invoice.paid': {
  const invoice = event.payload.invoice.entity
  const subscription = event.payload.subscription.entity
  const userId = subscription.notes?.user_id
  if (!userId) break

  await supabase
    .from('subscriptions')
    .update({
      status: 'active',
      trial_active: false,
      current_period_start: subscription.current_start 
        ? new Date(subscription.current_start * 1000).toISOString() 
        : null,
      current_period_end: subscription.current_end 
        ? new Date(subscription.current_end * 1000).toISOString() 
        : null,
      next_billing_at: subscription.current_end 
        ? new Date(subscription.current_end * 1000).toISOString() 
        : null,
    })
    .eq('user_id', userId)
}
```

**Impact:** Medium - Billing dates may be inaccurate

---

### Issue #9: Cancel Subscription - No Authentication Check
**File:** `src/app/api/razorpay/cancel-subscription/route.ts`  
**Severity:** 🟡 IMPORTANT

**Problem:** No user authentication before cancelling

**Fix:** Add authentication check at start of function:
```typescript
const supabase = await createClient()

const { data: { user }, error: authError } = await supabase.auth.getUser()
if (authError || !user) {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
}
```

**Impact:** High - Security vulnerability

---

### Issue #10: Cancel Subscription - No Database Update
**File:** `src/app/api/razorpay/cancel-subscription/route.ts`  
**Severity:** 🟡 IMPORTANT

**Problem:** Only cancels in Razorpay, doesn't update database

**Fix:** Add database update after Razorpay call:
```typescript
await supabase
  .from('subscriptions')
  .update({
    cancelled_at: new Date().toISOString(),
  })
  .eq('user_id', user.id)
  .eq('razorpay_subscription_id', subscriptionId)
```

**Impact:** Medium - Race condition with webhook

---

### Issue #11: Activate Trial - Missing Status Update
**File:** `src/app/api/razorpay/activate-trial/route.ts`  
**Lines:** 246-256  
**Severity:** 🟡 IMPORTANT

**Problem:** Doesn't update status to 'active' after card invoice

**Fix:**
```typescript
const { error: updateError } = await supabase
  .from('subscriptions')
  .update({ 
    trial_active: false,
    status: 'active', // Add this
    updated_at: new Date().toISOString()
  })
  .eq('id', subscription.id)
```

**Impact:** Low - Status may remain 'authenticated' instead of 'active'

---

## 📋 FIX IMPLEMENTATION PLAN

### Phase 1: Critical Fixes (Priority 1) 🔴
**Estimated Time:** 30 minutes

1. ✅ Fix webhook `subscription.activated` trial logic
2. ✅ Fix cancel subscription to use end-of-cycle
3. ✅ Fix trial expiry calculation in create-subscription
4. ✅ Fix period dates calculation in create-subscription

**Impact:** Fixes major user-facing bugs

---

### Phase 2: Important Fixes (Priority 2) 🟡
**Estimated Time:** 45 minutes

5. ✅ Add `subscription.pending` webhook handler
6. ✅ Add `subscription.resumed` webhook handler
7. ✅ Add period updates to `subscription.authenticated`
8. ✅ Add period updates to `invoice.paid`
9. ✅ Add authentication to cancel-subscription
10. ✅ Add database update to cancel-subscription
11. ✅ Add status update to activate-trial

**Impact:** Improves reliability and data accuracy

---

### Phase 3: Testing & Verification
**Estimated Time:** 30 minutes

- Test subscription creation flow
- Test webhook processing
- Test cancellation flow
- Test trial activation
- Verify database updates
- Check MCP test results

---

## 📊 SUMMARY

| Category | Count | Status |
|----------|-------|--------|
| Critical Issues | 4 | 🔴 Must fix |
| Important Issues | 7 | 🟡 Should fix |
| **Total Issues** | **11** | **Needs attention** |

**Recommendation:** Fix all 11 issues in order of priority

**Estimated Total Time:** ~2 hours including testing

---

## ✅ NEXT STEPS

1. Review and approve this fix plan
2. Implement Phase 1 (Critical fixes)
3. Implement Phase 2 (Important fixes)
4. Run comprehensive tests
5. Commit and deploy changes
6. Monitor production for issues

**Ready to proceed with fixes?** 🚀
