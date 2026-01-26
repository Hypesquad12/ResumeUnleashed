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

// Razorpay Plan IDs
// Note: Razorpay only supports INR currency, so ROW plans are also in INR
// ROW plans are created dynamically based on live USD→INR conversion rates
export const RAZORPAY_PLAN_IDS = {
  india: {
    professional_monthly: 'plan_RyebhKyadxFPUY', // ₹499
    professional_annual: 'plan_Ryebi5wDrJgrsE',   // ₹4,491
    premium_monthly: 'plan_S8WW9X48HZ5ABt',       // ₹799 (updated)
    premium_annual: 'plan_S8WWJ033Hj88pa',        // ₹7,191 (updated)
    ultimate_monthly: 'plan_Ryech70IbCoVES',      // ₹1,199
    ultimate_annual: 'plan_RyechtDpt6uWcu',       // ₹10,791
  },
  // ROW subscriptions are created dynamically with live INR amounts
  // No predefined plan IDs - amount calculated at subscription time
}
