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

// Razorpay Plan IDs (to be filled after creating plans in Razorpay Dashboard)
export const RAZORPAY_PLAN_IDS = {
  india: {
    professional_monthly: 'plan_xxxxx',
    professional_annual: 'plan_xxxxx',
    premium_monthly: 'plan_xxxxx',
    premium_annual: 'plan_xxxxx',
    ultimate_monthly: 'plan_xxxxx',
    ultimate_annual: 'plan_xxxxx',
  },
  row: {
    professional_monthly: 'plan_xxxxx',
    professional_annual: 'plan_xxxxx',
    premium_monthly: 'plan_xxxxx',
    premium_annual: 'plan_xxxxx',
    ultimate_monthly: 'plan_xxxxx',
    ultimate_annual: 'plan_xxxxx',
  },
}
