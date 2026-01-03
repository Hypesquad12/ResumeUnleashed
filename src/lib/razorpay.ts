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
// The frontend will display USD equivalent prices for international users
export const RAZORPAY_PLAN_IDS = {
  india: {
    professional_monthly: 'plan_RyebhKyadxFPUY', // ₹499
    professional_annual: 'plan_Ryebi5wDrJgrsE',   // ₹4,491
    premium_monthly: 'plan_RyecfdilZvSwQR',       // ₹899
    premium_annual: 'plan_RyecgHuskKvivp',        // ₹8,091
    ultimate_monthly: 'plan_Ryech70IbCoVES',      // ₹1,199
    ultimate_annual: 'plan_RyechtDpt6uWcu',       // ₹10,791
  },
  row: {
    // ROW plans in INR (₹830 ≈ $10, ₹1410 ≈ $17, ₹1660 ≈ $20)
    professional_monthly: 'plan_RyeciXNJ0by01K', // ₹830
    professional_annual: 'plan_RyecjJrhRaOC2C',   // ₹7,970
    premium_monthly: 'plan_Ryecjsb29rR3AA',       // ₹1,410
    premium_annual: 'plan_Ryecka1EcRkGXF',        // ₹13,540
    ultimate_monthly: 'plan_Ryecl9puJyk5Jt',      // ₹1,660
    ultimate_annual: 'plan_Ryeclh4JoPMp6T',       // ₹15,920
  },
}
