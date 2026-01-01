# Subscription & Payment Implementation Roadmap

## ✅ Completed

### 1. Database Schema (Supabase)
- ✅ Created `subscription_plans` table with India and ROW pricing
- ✅ Created `subscriptions` table for user subscriptions
- ✅ Created `payment_transactions` table for payment tracking
- ✅ Created `usage_tracking` table for feature usage monitoring
- ✅ Implemented RLS policies for all tables
- ✅ Added helper functions: `check_usage_limit()` and `increment_usage()`
- ✅ Inserted pricing plans:
  - **India (INR):** ₹0, ₹499, ₹899, ₹1,199
  - **ROW (USD):** $0, $9.99, $16.99, $19.99

### 2. Pricing Configuration
- ✅ Created `src/lib/pricing-config.ts` with TypeScript types and pricing data
- ✅ Helper functions for region detection, price formatting, and savings calculation

---

## 🚧 Next Steps

### 3. Razorpay Setup (Required)
You need to:
1. **Create Razorpay Account:** https://dashboard.razorpay.com/signup
2. **Get API Keys:**
   - Go to Settings → API Keys
   - Generate Test Mode keys (for development)
   - Generate Live Mode keys (for production)
3. **Add to Environment Variables:**
   ```env
   # .env.local
   RAZORPAY_KEY_ID=rzp_test_xxxxx
   RAZORPAY_KEY_SECRET=xxxxx
   NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_xxxxx
   ```

### 4. Create Razorpay Subscription Plans
You need to create subscription plans in Razorpay Dashboard:

#### India Plans (INR):
- **Professional Monthly:** ₹499/month
- **Professional Annual:** ₹4,491/year
- **Premium Monthly:** ₹899/month
- **Premium Annual:** ₹8,091/year
- **Ultimate Monthly:** ₹1,199/month
- **Ultimate Annual:** ₹10,791/year

#### ROW Plans (USD):
- **Professional Monthly:** $9.99/month
- **Professional Annual:** $95.90/year
- **Premium Monthly:** $16.99/month
- **Premium Annual:** $163.10/year
- **Ultimate Monthly:** $19.99/month
- **Ultimate Annual:** $191.90/year

**Note:** Save the Plan IDs from Razorpay and add them to the pricing config.

---

## 📋 Implementation Checklist

### Phase 1: Backend Setup
- [ ] Install Razorpay SDK: `npm install razorpay`
- [ ] Create API route: `/api/razorpay/create-order`
- [ ] Create API route: `/api/razorpay/verify-payment`
- [ ] Create API route: `/api/razorpay/webhook`
- [ ] Add webhook signature verification
- [ ] Handle subscription creation in database
- [ ] Handle payment success/failure events

### Phase 2: Frontend Implementation
- [ ] Create pricing page: `/app/(marketing)/pricing/page.tsx`
- [ ] Implement geo-detection (IP-based)
- [ ] Create pricing cards with decoy strategy
- [ ] Add Razorpay checkout script
- [ ] Create checkout modal/flow
- [ ] Handle payment success/failure UI
- [ ] Add loading states and error handling

### Phase 3: Subscription Management
- [ ] Create subscription dashboard: `/app/(dashboard)/subscription/page.tsx`
- [ ] Show current plan and usage
- [ ] Add upgrade/downgrade functionality
- [ ] Add cancel subscription flow
- [ ] Show payment history
- [ ] Display usage limits and current usage

### Phase 4: Usage Enforcement
- [ ] Add middleware to check subscription status
- [ ] Implement usage limit checks before AI operations
- [ ] Show upgrade prompts when limits reached
- [ ] Add usage tracking to AI customization
- [ ] Add usage tracking to interview prep
- [ ] Add usage tracking to job matching

### Phase 5: Testing
- [ ] Test payment flow in test mode
- [ ] Test webhook handling
- [ ] Test subscription creation
- [ ] Test usage limits
- [ ] Test upgrade/downgrade
- [ ] Test cancellation
- [ ] Test annual vs monthly billing

### Phase 6: Production
- [ ] Switch to live Razorpay keys
- [ ] Configure production webhook URL
- [ ] Test with real payments (small amounts)
- [ ] Monitor payment success rate
- [ ] Set up payment failure alerts
- [ ] Configure automatic retry for failed payments

---

## 🎯 Pricing Strategy Summary

### Decoy Pricing Effect:
- **Target Tier:** Premium ($16.99 or ₹899) - 70% of conversions expected
- **Decoy Tier:** Ultimate ($19.99 or ₹1,199) - Makes Premium look amazing
- **Entry Tier:** Professional ($9.99 or ₹499) - Budget users

### Key Features by Tier:

| Feature | Professional | Premium ⭐ | Ultimate |
|---------|-------------|-----------|----------|
| AI Customizations | 15/month | 75/month | 100/month |
| Interview Prep | 2/month | 12/month | 15/month |
| Templates | 10 | ALL 25+ | ALL 25+ |
| Job Matching | 10/month | Unlimited | Unlimited |
| Resumes | 5 | 15 | Unlimited |

### Revenue Projections (1,000 paid users):
- **India:** ₹8,69,000/month (~$10,440/month)
- **ROW:** $16,241/month
- **Combined:** ~$26,681/month
- **Annual:** ~$320,172/year

### Profit Margins:
- Professional: 95-97%
- Premium: 90-94%
- Ultimate: 35-55% (includes human support)

---

## 🔐 Security Considerations

1. **Webhook Verification:**
   - Always verify Razorpay webhook signatures
   - Use constant-time comparison for signatures
   - Log all webhook events

2. **Payment Data:**
   - Never store card details
   - Only store Razorpay IDs
   - Use HTTPS for all payment pages

3. **Subscription Status:**
   - Check subscription status on every protected route
   - Implement server-side validation
   - Don't trust client-side subscription checks

4. **Usage Limits:**
   - Enforce limits server-side
   - Use database transactions for usage updates
   - Implement rate limiting

---

## 📞 Support & Documentation

- **Razorpay Docs:** https://razorpay.com/docs/
- **Razorpay Subscriptions:** https://razorpay.com/docs/payments/subscriptions/
- **Razorpay Webhooks:** https://razorpay.com/docs/webhooks/
- **Test Cards:** https://razorpay.com/docs/payments/payments/test-card-details/

---

## 🐛 Common Issues & Solutions

### Issue: Webhook not receiving events
- **Solution:** Check webhook URL is publicly accessible
- **Solution:** Verify webhook secret is correct
- **Solution:** Check Razorpay webhook logs

### Issue: Payment succeeds but subscription not created
- **Solution:** Check webhook handler is processing events
- **Solution:** Verify database permissions
- **Solution:** Check server logs for errors

### Issue: Usage limits not enforcing
- **Solution:** Verify `check_usage_limit()` function is called
- **Solution:** Check subscription status is 'active'
- **Solution:** Verify period dates are correct

---

## 📊 Monitoring & Analytics

Track these metrics:
1. **Conversion Rate:** Free → Paid
2. **Tier Distribution:** Professional vs Premium vs Ultimate
3. **Churn Rate:** Monthly cancellations
4. **Average Revenue Per User (ARPU)**
5. **Customer Lifetime Value (LTV)**
6. **Payment Success Rate**
7. **Failed Payment Recovery Rate**

---

## 🚀 Launch Checklist

Before going live:
- [ ] All tests passing
- [ ] Razorpay live keys configured
- [ ] Webhook URL configured in Razorpay
- [ ] Legal pages updated (done ✅)
- [ ] Pricing page live
- [ ] Subscription dashboard working
- [ ] Usage limits enforced
- [ ] Payment success/failure emails configured
- [ ] Support email configured
- [ ] Analytics tracking setup
- [ ] Backup and monitoring in place
