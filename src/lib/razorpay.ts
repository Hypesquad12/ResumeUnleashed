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
// Conversion rate: ₹89 = $1
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
    // ROW plans in INR (₹89 = $1)
    // $9.99 = ₹889, $95.99 = ₹8,543
    // $16.99 = ₹1,512, $162.99 = ₹14,506
    // $19.99 = ₹1,779, $191.99 = ₹17,087
    professional_monthly: 'plan_RyeciXNJ0by01K', // ₹889 ($9.99)
    professional_annual: 'plan_RyecjJrhRaOC2C',   // ₹8,543 ($95.99)
    premium_monthly: 'plan_Ryecjsb29rR3AA',       // ₹1,512 ($16.99)
    premium_annual: 'plan_Ryecka1EcRkGXF',        // ₹14,506 ($162.99)
    ultimate_monthly: 'plan_Ryecl9puJyk5Jt',      // ₹1,779 ($19.99)
    ultimate_annual: 'plan_Ryeclh4JoPMp6T',       // ₹17,087 ($191.99)
  },
}
