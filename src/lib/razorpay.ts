import Razorpay from 'razorpay'
import crypto from 'crypto'

// Initialize Razorpay instance (server-side only)
export function getRazorpayInstance() {
  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
    throw new Error('Razorpay credentials not configured')
  }

  return new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  })
}

// Verify Razorpay payment signature
export function verifyPaymentSignature(
  orderId: string,
  paymentId: string,
  signature: string
): boolean {
  const secret = process.env.RAZORPAY_KEY_SECRET
  if (!secret) {
    throw new Error('Razorpay secret not configured')
  }

  const body = orderId + '|' + paymentId
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(body)
    .digest('hex')

  return expectedSignature === signature
}

// Verify Razorpay webhook signature
export function verifyWebhookSignature(
  payload: string,
  signature: string
): boolean {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET
  if (!secret) {
    throw new Error('Razorpay webhook secret not configured')
  }

  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex')

  return crypto.timingSafeEqual(
    Buffer.from(expectedSignature),
    Buffer.from(signature)
  )
}

// Razorpay Plan IDs (TEST MODE)
// Note: Razorpay only supports INR currency, so ROW plans are also in INR
// ROW plans are created dynamically based on live USD→INR conversion rates
export const RAZORPAY_PLAN_IDS = {
  india: {
    professional_monthly: 'plan_S9NmrJnKexiXyB', // ₹499
    professional_annual: 'plan_S9NmrtcwTLSvEH',   // ₹4,491
    premium_monthly: 'plan_S9NmsU4RkA7EhR',       // ₹799
    premium_annual: 'plan_S9Nmt62v025Y9M',        // ₹7,191
    ultimate_monthly: 'plan_S9NmtlgktraABU',      // ₹1,099
    ultimate_annual: 'plan_S9NmuUyWQC7eAp',       // ₹9,891
  },
  // ROW subscriptions are created dynamically with live INR amounts
  // No predefined plan IDs - amount calculated at subscription time
}
