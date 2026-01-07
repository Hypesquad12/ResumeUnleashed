import { NextRequest, NextResponse } from 'next/server'
import { getRazorpayInstance } from '@/lib/razorpay'

export async function POST(request: NextRequest) {
  try {
    const { couponCode, planAmount } = await request.json()

    if (!couponCode) {
      return NextResponse.json({ error: 'Coupon code is required' }, { status: 400 })
    }

    const razorpay = getRazorpayInstance()

    // Fetch all active offers from Razorpay
    // Note: Razorpay doesn't have a direct "validate coupon" endpoint
    // We need to fetch offers and check if the code matches
    try {
      // This would require Razorpay Offers API - for now, we'll implement manual validation
      // In production, you'd create offers in Razorpay dashboard and fetch them here
      
      // Example: Hardcoded promo codes for now (move to database later)
      const promoCodes: Record<string, { discount: number; type: 'percentage' | 'flat'; maxDiscount?: number }> = {
        'WELCOME10': { discount: 10, type: 'percentage', maxDiscount: 100 },
        'SAVE20': { discount: 20, type: 'percentage', maxDiscount: 200 },
        'FLAT100': { discount: 100, type: 'flat' },
        'FLAT200': { discount: 200, type: 'flat' },
      }

      const promo = promoCodes[couponCode.toUpperCase()]

      if (!promo) {
        return NextResponse.json({ 
          valid: false, 
          error: 'Invalid coupon code' 
        }, { status: 400 })
      }

      // Calculate discount
      let discountAmount = 0
      if (promo.type === 'percentage') {
        discountAmount = Math.round((planAmount * promo.discount) / 100)
        if (promo.maxDiscount && discountAmount > promo.maxDiscount) {
          discountAmount = promo.maxDiscount
        }
      } else {
        discountAmount = promo.discount
      }

      const finalAmount = Math.max(0, planAmount - discountAmount)

      return NextResponse.json({
        valid: true,
        couponCode: couponCode.toUpperCase(),
        discount: promo.discount,
        discountType: promo.type,
        discountAmount,
        originalAmount: planAmount,
        finalAmount,
      })

    } catch (error: any) {
      console.error('Coupon validation error:', error)
      return NextResponse.json(
        { valid: false, error: 'Failed to validate coupon' },
        { status: 500 }
      )
    }

  } catch (error) {
    console.error('Coupon validation error:', error)
    return NextResponse.json(
      { error: 'Failed to validate coupon' },
      { status: 500 }
    )
  }
}
