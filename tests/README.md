# Razorpay Subscription Flow Tests

This directory contains comprehensive tests for all Razorpay subscription flows.

## Test Flows

### Flow 1: Signup and Mandate Setup
Tests the initial user signup and trial subscription creation flow.

**Steps:**
1. Create new user account
2. Select a plan (Premium Monthly)
3. Create subscription with 7-day trial
4. Verify subscription created with `pending` status
5. Verify `trial_active = false` (before authentication)
6. Verify `trial_days = 7`

**Expected Result:**
- User created successfully
- Subscription created in Razorpay
- Database record created with correct trial settings
- Short URL generated for mandate setup

**Manual Step Required:**
- Complete mandate setup using the generated short URL
- Use test card: `4111 1111 1111 1111`
- After authentication, status should change to `authenticated`
- `trial_active` should become `true`

---

### Flow 2: Cancel Trial
Tests canceling a trial subscription while maintaining access until trial end.

**Prerequisites:**
- User has active trial (`authenticated` status, `trial_active = true`)

**Steps:**
1. Verify user has active trial
2. Call cancel subscription API
3. Verify subscription cancelled in Razorpay
4. Verify `cancelled_at` timestamp set
5. Verify user still has access until `current_period_end`

**Expected Result:**
- Subscription cancelled successfully
- Mandate cancelled in Razorpay
- User maintains access until trial end date
- No charges will be made

---

### Flow 3: Limit Reached and Activated
Tests the flow when a trial user hits their limits and decides to activate early.

**Prerequisites:**
- User has active trial
- User has used trial limits (e.g., 2/2 customizations)

**Steps:**
1. Check current usage (should be at limit)
2. Attempt action that exceeds limit
3. Verify upgrade modal shown
4. Click "Activate Now" button
5. Complete payment
6. Verify `trial_active = false`
7. Verify `status = active`
8. Verify limits increased to plan limits

**Expected Result:**
- Limits correctly enforced
- Activation flow initiated
- Payment processed
- Trial ended, full plan activated
- User can now use full plan limits

---

### Flow 4: Cancelled then Activated
Tests reactivating after cancelling a trial.

**Prerequisites:**
- User cancelled trial but still within trial period
- User has access until trial end date

**Steps:**
1. Verify subscription is cancelled but accessible
2. User decides to reactivate
3. Create new subscription
4. Verify old subscription remains cancelled
5. Verify new subscription created
6. Verify `trial_days = 0` (returning customer, no new trial)

**Expected Result:**
- New subscription created without trial
- Old subscription remains cancelled
- User charged immediately (no trial)
- Full plan access granted

---

### Flow 5: Cancel Subscription (Paid)
Tests canceling a paid subscription (not trial).

**Prerequisites:**
- User has paid subscription (`status = active`, `trial_active = false`)
- User has made at least one payment

**Steps:**
1. Verify active paid subscription
2. Cancel subscription
3. Verify cancellation in Razorpay
4. Verify `cancelled_at` timestamp set
5. Verify access maintained until `current_period_end`
6. Verify no future charges scheduled

**Expected Result:**
- Subscription cancelled successfully
- User maintains access until current period end
- No future billing
- After period end, user moved to free plan

---

## Running the Tests

### Prerequisites

1. **Development server must be running:**
   ```bash
   npm run dev
   ```

2. **Environment variables must be set in `.env.local`:**
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   NEXT_PUBLIC_RAZORPAY_KEY_ID=your_razorpay_key_id
   RAZORPAY_KEY_SECRET=your_razorpay_secret
   ```

3. **Install dependencies:**
   ```bash
   npm install
   ```

### Run All Tests

```bash
# Make script executable
chmod +x tests/run-razorpay-tests.sh

# Run tests
./tests/run-razorpay-tests.sh
```

Or using npm:

```bash
npm run test:razorpay
```

### Run Individual Test

```bash
npx tsx tests/razorpay-flows.test.ts
```

---

## Test Output

The test script provides detailed output for each flow:

```
🧪 Razorpay Subscription Flow Tests

📝 FLOW 1: Signup and Mandate Setup
==================================================

1️⃣  Creating test user account...
✅ User created: abc123...

2️⃣  Getting user session...
✅ Session obtained

3️⃣  Creating subscription (Premium Monthly, India)...
✅ Subscription created: sub_xyz789
   Short URL: https://rzp.io/i/abc123

4️⃣  Verifying subscription in database...
✅ Subscription verified:
   Status: pending
   Trial Active: false
   Trial Days: 7
   Tier: premium
   Billing Cycle: monthly
   Razorpay Sub ID: sub_xyz789

✅ FLOW 1 COMPLETED SUCCESSFULLY

📋 Next Steps (Manual):
   1. Open: https://rzp.io/i/abc123
   2. Complete mandate setup (use test card: 4111 1111 1111 1111)
   3. After authentication, status should change to 'authenticated'
   4. trial_active should become true
```

---

## Manual Steps Required

Some flows require manual intervention:

1. **Mandate Setup (Flow 1):**
   - Open the Razorpay short URL
   - Complete payment method authorization
   - Use test card: `4111 1111 1111 1111`
   - CVV: any 3 digits
   - Expiry: any future date

2. **Payment Completion (Flow 3, 4):**
   - Open the payment URL
   - Complete the payment
   - Verify webhook updates

---

## Troubleshooting

### Dev server not running
```
❌ Error: Dev server is not running at http://localhost:3000
```
**Solution:** Start the dev server with `npm run dev`

### Environment variables missing
```
❌ Error: NEXT_PUBLIC_SUPABASE_URL not set
```
**Solution:** Create `.env.local` with all required variables

### Subscription creation fails
```
❌ Subscription creation failed: Plan not found
```
**Solution:** Verify Razorpay plan IDs are correctly configured in `src/lib/pricing-config.ts`

### Webhook not received
**Solution:** 
- Check Razorpay webhook configuration
- Verify webhook secret matches
- Check Supabase Edge Function logs

---

## Database Cleanup

After testing, you may want to clean up test data:

```sql
-- Delete test user and related data
DELETE FROM subscriptions WHERE user_id = 'test_user_id';
DELETE FROM profiles WHERE id = 'test_user_id';
-- Note: Auth user deletion requires Supabase dashboard or admin API
```

---

## CI/CD Integration

To run these tests in CI/CD:

1. Set environment variables as secrets
2. Start dev server in background
3. Run tests
4. Clean up test data

Example GitHub Actions:

```yaml
- name: Run Razorpay Tests
  env:
    NEXT_PUBLIC_SUPABASE_URL: ${{ secrets.SUPABASE_URL }}
    SUPABASE_SERVICE_ROLE_KEY: ${{ secrets.SUPABASE_SERVICE_KEY }}
  run: |
    npm run dev &
    sleep 10
    npm run test:razorpay
```

---

## Notes

- Tests create real subscriptions in Razorpay (use test mode)
- Each test run creates a new test user
- Manual steps are required for payment flows
- Webhooks must be properly configured
- Tests verify both API responses and database state
