# Critical Fixes - Test Plan

**Test Date:** January 29, 2026  
**Fixes Tested:** 4 Critical Issues  
**Commit:** 3bfc6bb

---

## Test Scenarios

### ✅ Test #1: Webhook Trial Logic (subscription.activated)

**What was fixed:**
- `subscription.activated` no longer sets `trial_active = false`
- Trial remains active until `invoice.paid` event

**Test Steps:**

1. **Create a new subscription with trial**
   ```bash
   # Use MCP to check database
   mcp0_execute_sql({
     project_id: "ligrkhpksdotctcwrxfn",
     query: "SELECT user_id, status, trial_active, trial_days FROM subscriptions WHERE trial_days > 0 ORDER BY created_at DESC LIMIT 1"
   })
   ```
   **Expected:** `status = 'pending'`, `trial_active = false`

2. **Simulate webhook: subscription.authenticated**
   - User completes mandate setup
   - Webhook fires with `subscription.authenticated`
   
   **Expected Database State:**
   - `status = 'authenticated'`
   - `trial_active = true` ✅
   - `current_period_start` and `current_period_end` updated

3. **Simulate webhook: subscription.activated**
   - Billing cycle starts (at `start_at` date)
   - Webhook fires with `subscription.activated`
   
   **Expected Database State:**
   - `status = 'active'`
   - `trial_active = true` ✅ (SHOULD REMAIN TRUE)
   - `current_period_start` and `current_period_end` updated from Razorpay

4. **Simulate webhook: invoice.paid**
   - First invoice payment successful
   - Webhook fires with `invoice.paid`
   
   **Expected Database State:**
   - `status = 'active'`
   - `trial_active = false` ✅ (NOW IT ENDS)
   - `next_billing_at` updated

**Verification Query:**
```sql
SELECT 
  user_id,
  status,
  trial_active,
  trial_days,
  current_period_start,
  current_period_end,
  created_at
FROM subscriptions
WHERE user_id = 'USER_ID'
ORDER BY created_at DESC
LIMIT 1;
```

**Success Criteria:**
- ✅ Trial remains active through `subscription.activated`
- ✅ Trial only ends at `invoice.paid`
- ✅ Period dates updated correctly

---

### ✅ Test #2: Cancel Subscription End-of-Cycle

**What was fixed:**
- Changed from immediate cancellation (`false`) to end-of-cycle (`true`)
- Users keep access until `current_period_end`

**Test Steps:**

1. **Get active subscription**
   ```sql
   SELECT 
     razorpay_subscription_id,
     current_period_end,
     status
   FROM subscriptions
   WHERE user_id = 'USER_ID'
   AND status IN ('active', 'authenticated');
   ```

2. **Call cancel API**
   ```bash
   POST /api/razorpay/cancel-subscription
   {
     "subscriptionId": "sub_xxx"
   }
   ```

3. **Check Razorpay response**
   - Should return `cancel_at_cycle_end: 1` in response
   - Subscription should show as "scheduled for cancellation"

4. **Verify database after webhook**
   ```sql
   SELECT 
     status,
     cancelled_at,
     current_period_end
   FROM subscriptions
   WHERE razorpay_subscription_id = 'sub_xxx';
   ```
   
   **Expected:**
   - `cancelled_at` is set
   - `status = 'cancelled'` (after webhook)
   - User still has access until `current_period_end`

**Success Criteria:**
- ✅ Razorpay API called with `true` (end-of-cycle)
- ✅ User maintains access until period end
- ✅ No immediate access revocation

---

### ✅ Test #3: Trial Expiry Calculation

**What was fixed:**
- Changed from `NOW + 7 days` to `start_at` date
- Trial expires when first charge happens

**Test Steps:**

1. **Create subscription with 7-day trial**
   ```bash
   POST /api/razorpay/create-subscription
   {
     "planId": "premium",
     "billingCycle": "monthly",
     "region": "india",
     "tier": "premium"
   }
   ```

2. **Check database immediately**
   ```sql
   SELECT 
     trial_days,
     trial_expires_at,
     start_at,
     created_at,
     EXTRACT(EPOCH FROM (trial_expires_at - created_at))/86400 as days_difference
   FROM subscriptions
   WHERE user_id = 'USER_ID'
   ORDER BY created_at DESC
   LIMIT 1;
   ```

3. **Verify calculation**
   - `trial_expires_at` should equal `start_at`
   - NOT `created_at + 7 days`
   - Difference should be ~7 days from NOW to `trial_expires_at`

**Expected Values:**
```
trial_days: 7
trial_expires_at: 2026-02-05 (example, 7 days from now)
start_at: 2026-02-05 (SAME as trial_expires_at)
created_at: 2026-01-29
```

**Success Criteria:**
- ✅ `trial_expires_at = start_at`
- ✅ Trial period = time between NOW and `start_at`
- ✅ Matches Razorpay official behavior

---

### ✅ Test #4: Period Dates Calculation

**What was fixed:**
- `current_period_start` and `current_period_end` now start from `start_at`
- Not from `NOW`

**Test Steps:**

1. **Create subscription with trial**
   ```bash
   POST /api/razorpay/create-subscription
   {
     "planId": "premium",
     "billingCycle": "monthly",
     "region": "india",
     "tier": "premium"
   }
   ```

2. **Check period dates**
   ```sql
   SELECT 
     start_at,
     current_period_start,
     current_period_end,
     created_at,
     EXTRACT(EPOCH FROM (current_period_start - created_at))/86400 as start_delay_days,
     EXTRACT(EPOCH FROM (current_period_end - current_period_start))/86400 as period_length_days
   FROM subscriptions
   WHERE user_id = 'USER_ID'
   ORDER BY created_at DESC
   LIMIT 1;
   ```

3. **Verify values**
   - `current_period_start` should equal `start_at`
   - `current_period_end` should be `start_at + 1 month` (for monthly)
   - NOT `NOW` and `NOW + 1 month`

**Expected Values (Monthly Plan with 7-day trial):**
```
created_at: 2026-01-29
start_at: 2026-02-05 (7 days later)
current_period_start: 2026-02-05 (SAME as start_at)
current_period_end: 2026-03-05 (1 month after start_at)
start_delay_days: ~7 (trial period)
period_length_days: ~30 (billing cycle)
```

**Success Criteria:**
- ✅ `current_period_start = start_at`
- ✅ `current_period_end = start_at + billing_cycle`
- ✅ Billing period reflects actual billing, not creation time

---

## Quick Test Using MCP

### Test Fix #1 & #4: Check Recent Subscription
```typescript
mcp0_execute_sql({
  project_id: "ligrkhpksdotctcwrxfn",
  query: `
    SELECT 
      user_id,
      status,
      trial_active,
      trial_days,
      trial_expires_at,
      start_at,
      current_period_start,
      current_period_end,
      created_at,
      -- Verify trial_expires_at = start_at
      CASE 
        WHEN trial_expires_at = start_at THEN 'CORRECT'
        ELSE 'WRONG'
      END as trial_expiry_check,
      -- Verify current_period_start = start_at
      CASE 
        WHEN current_period_start = start_at THEN 'CORRECT'
        ELSE 'WRONG'
      END as period_start_check
    FROM subscriptions
    WHERE created_at > NOW() - INTERVAL '1 hour'
    ORDER BY created_at DESC
    LIMIT 5;
  `
})
```

### Test Fix #2: Check Cancelled Subscriptions
```typescript
mcp0_execute_sql({
  project_id: "ligrkhpksdotctcwrxfn",
  query: `
    SELECT 
      user_id,
      status,
      cancelled_at,
      current_period_end,
      CASE 
        WHEN cancelled_at IS NOT NULL AND current_period_end > NOW() 
        THEN 'Access maintained until ' || current_period_end::date
        ELSE 'Access expired or not cancelled'
      END as access_status
    FROM subscriptions
    WHERE cancelled_at IS NOT NULL
    ORDER BY cancelled_at DESC
    LIMIT 5;
  `
})
```

---

## Manual Testing Checklist

### Pre-Test Setup
- [ ] Dev server running (`npm run dev`)
- [ ] Razorpay test mode enabled
- [ ] Test user account ready
- [ ] Webhook endpoint accessible

### Test Execution

#### Test #1: Trial Logic
- [ ] Create new subscription with trial
- [ ] Complete mandate setup (Razorpay hosted page)
- [ ] Verify `subscription.authenticated` webhook received
- [ ] Check `trial_active = true` in database
- [ ] Wait for `subscription.activated` webhook
- [ ] Verify `trial_active` STILL `true` ✅
- [ ] Simulate or wait for `invoice.paid`
- [ ] Verify `trial_active = false` ✅

#### Test #2: Cancellation
- [ ] Get active subscription
- [ ] Call cancel API
- [ ] Verify Razorpay shows "scheduled for cancellation"
- [ ] Check user still has access
- [ ] Verify `cancelled_at` timestamp set
- [ ] Confirm access until `current_period_end`

#### Test #3: Trial Expiry
- [ ] Create subscription with trial
- [ ] Check database `trial_expires_at`
- [ ] Verify equals `start_at` ✅
- [ ] Verify NOT `created_at + 7 days` ✅

#### Test #4: Period Dates
- [ ] Create subscription with trial
- [ ] Check `current_period_start`
- [ ] Verify equals `start_at` ✅
- [ ] Check `current_period_end`
- [ ] Verify equals `start_at + 1 month` ✅

---

## Expected Test Results

| Fix | Test | Expected Result | Status |
|-----|------|-----------------|--------|
| #1 | Trial logic | `trial_active` stays true until invoice paid | ⏳ Pending |
| #2 | Cancellation | End-of-cycle, access maintained | ⏳ Pending |
| #3 | Trial expiry | `trial_expires_at = start_at` | ⏳ Pending |
| #4 | Period dates | `current_period_start = start_at` | ⏳ Pending |

---

## Test Results

### Automated Tests (MCP)
```
Run: mcp0_execute_sql queries above
Results: [To be filled after testing]
```

### Manual Tests
```
[To be filled after manual testing]
```

---

## Next Steps After Testing

If all tests pass:
- ✅ Proceed with Phase 2 (Important fixes)
- ✅ Deploy to production

If tests fail:
- ❌ Review failed test
- ❌ Debug and fix issue
- ❌ Re-test
