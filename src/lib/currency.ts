// Currency conversion utilities using free exchangerate-api.com
// Free tier: 1,500 requests/month

interface ExchangeRateResponse {
  result: string
  base_code: string
  conversion_rates: {
    INR: number
    [key: string]: number
  }
}

let cachedRate: { rate: number; timestamp: number } | null = null
const CACHE_DURATION = 60 * 60 * 1000 // 1 hour cache

/**
 * Fetch live USD to INR exchange rate
 * Uses free exchangerate-api.com with 1-hour caching to minimize API calls
 */
export async function getUsdToInrRate(): Promise<number> {
  // Check cache
  if (cachedRate && Date.now() - cachedRate.timestamp < CACHE_DURATION) {
    console.log('Using cached exchange rate:', cachedRate.rate)
    return cachedRate.rate
  }

  try {
    const response = await fetch('https://open.exchangerate-api.com/v6/latest/USD')
    
    if (!response.ok) {
      throw new Error(`Exchange rate API error: ${response.status}`)
    }

    const data: ExchangeRateResponse = await response.json()
    
    if (data.result !== 'success' || !data.conversion_rates.INR) {
      throw new Error('Invalid exchange rate response')
    }

    const rate = data.conversion_rates.INR

    // Update cache
    cachedRate = {
      rate,
      timestamp: Date.now(),
    }

    console.log('Fetched live exchange rate USD→INR:', rate)
    return rate
  } catch (error) {
    console.error('Failed to fetch exchange rate, using fallback:', error)
    // Fallback to ₹89 = $1 if API fails
    return 89
  }
}

/**
 * Convert USD amount to INR using live exchange rate
 */
export async function convertUsdToInr(usdAmount: number): Promise<number> {
  const rate = await getUsdToInrRate()
  const inrAmount = Math.round(usdAmount * rate)
  console.log(`Converting $${usdAmount} → ₹${inrAmount} (rate: ${rate})`)
  return inrAmount
}

/**
 * Convert INR amount to USD using live exchange rate
 */
export async function convertInrToUsd(inrAmount: number): Promise<number> {
  const rate = await getUsdToInrRate()
  const usdAmount = parseFloat((inrAmount / rate).toFixed(2))
  console.log(`Converting ₹${inrAmount} → $${usdAmount} (rate: ${rate})`)
  return usdAmount
}
