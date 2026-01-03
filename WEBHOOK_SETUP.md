# Razorpay Webhook Configuration

## Webhook Setup Form Details

Use these exact values when setting up your webhook at: https://dashboard.razorpay.com/app/webhooks

---

## **Webhook URL**
```
https://www.resumeunleashed.com/api/razorpay/webhook
```

**Note**: Use HTTPS (not HTTP) for production. For local testing, use:
```
http://localhost:3000/api/razorpay/webhook
```

---

## **Secret**
Leave this field **empty** for now. After creating the webhook, Razorpay will generate a secret for you. Then:

1. Copy the generated secret
2. Add it to your `.env.local` file:
   ```bash
   RAZORPAY_WEBHOOK_SECRET=whsec_your_generated_secret_here
   ```

---

## **Alert Email**
```
info@hypesquad.ai
```
(or your preferred email for webhook failure notifications)

---

## **Active Events** (Check these boxes)

### ✅ Subscription Events (Required)
- ☑ `subscription.activated` - When subscription becomes active after payment
- ☑ `subscription.charged` - When subscription payment is successful
- ☑ `subscription.pending` - When subscription is created but payment pending
- ☑ `subscription.halted` - When subscription is paused due to payment failure
- ☑ `subscription.cancelled` - When subscription is cancelled
- ☑ `subscription.completed` - When subscription period ends
- ☑ `subscription.updated` - When subscription details are updated
- ☑ `subscription.paused` - When subscription is paused by user
- ☑ `subscription.resumed` - When paused subscription is resumed

### ✅ Payment Events (Optional but Recommended)
- ☑ `payment.authorized` - Payment authorized but not captured
- ☑ `payment.captured` - Payment successfully captured
- ☑ `payment.failed` - Payment failed

---

## **After Creating Webhook**

### 1. Copy the Webhook Secret
After clicking "Create Webhook", Razorpay will show you a secret like:
```
whsec_AbCdEfGhIjKlMnOpQrStUvWxYz1234567890
```

### 2. Update .env.local
Add the secret to your environment variables:
```bash
RAZORPAY_WEBHOOK_SECRET=whsec_AbCdEfGhIjKlMnOpQrStUvWxYz1234567890
```

### 3. Restart Your Server
```bash
# Stop current server (Ctrl+C)
npm run dev
```

---

## **Testing the Webhook**

### Local Testing (Optional)
For local development, you can use ngrok to expose your localhost:

1. Install ngrok: https://ngrok.com/download
2. Run ngrok:
   ```bash
   ngrok http 3000
   ```
3. Copy the HTTPS URL (e.g., `https://abc123.ngrok.io`)
4. Create a test webhook with URL: `https://abc123.ngrok.io/api/razorpay/webhook`
5. Test subscription flow

### Production Testing
1. Create a test subscription on your live site
2. Complete payment
3. Check webhook logs in Razorpay Dashboard: https://dashboard.razorpay.com/app/webhooks
4. Verify subscription status updated in your database

---

## **Webhook Handler Code**

The webhook handler is already implemented at:
`src/app/api/razorpay/webhook/route.ts`

It handles these events:
- `subscription.activated` → Updates subscription status to "active"
- `subscription.charged` → Records successful payment
- `subscription.cancelled` → Updates subscription status to "cancelled"
- `subscription.completed` → Marks subscription as completed

---

## **Troubleshooting**

### Webhook Not Receiving Events
1. Check webhook URL is correct and accessible
2. Verify webhook secret in `.env.local` matches Razorpay Dashboard
3. Check Razorpay webhook logs for errors
4. Ensure server is running and endpoint is not blocked by firewall

### Signature Verification Failed
1. Ensure `RAZORPAY_WEBHOOK_SECRET` in `.env.local` is correct
2. Check for extra spaces or newlines in the secret
3. Verify you're using the secret from the correct webhook

### Events Not Updating Database
1. Check server logs for errors
2. Verify Supabase connection is working
3. Check RLS policies allow webhook to update subscriptions table
4. Ensure `user_id` in webhook payload matches database

---

## **Security Best Practices**

1. ✅ Always use HTTPS in production
2. ✅ Keep webhook secret secure (never commit to git)
3. ✅ Verify webhook signatures before processing
4. ✅ Log all webhook events for debugging
5. ✅ Implement retry logic for failed webhook processing
6. ✅ Monitor webhook failures via email alerts

---

## **Webhook Event Flow**

```
User subscribes → Razorpay creates subscription → User pays
    ↓
Razorpay sends webhook: subscription.activated
    ↓
Your server receives webhook → Verifies signature
    ↓
Updates database: status = "active"
    ↓
User can access premium features
```

---

## **Quick Reference**

| Field | Value |
|-------|-------|
| Webhook URL | `https://www.resumeunleashed.com/api/razorpay/webhook` |
| Alert Email | `info@hypesquad.ai` |
| Events | All subscription.* events + payment.* events |
| Secret Location | `.env.local` as `RAZORPAY_WEBHOOK_SECRET` |

---

## **Next Steps**

1. ✅ Create webhook in Razorpay Dashboard
2. ✅ Copy webhook secret
3. ✅ Add secret to `.env.local`
4. ✅ Restart server
5. ✅ Test subscription flow
6. ✅ Monitor webhook logs
