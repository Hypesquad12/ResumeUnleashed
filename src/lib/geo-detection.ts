import { Region } from './pricing-config'

/**
 * Detect user's region based on IP geolocation
 * Uses a free IP geolocation API
 */
export async function detectUserRegion(): Promise<Region> {
  try {
    console.log('[GEO-DETECTION] Starting IP-based detection...')
    
    // Use ipapi.co for free IP geolocation (no API key required)
    const response = await fetch('https://ipapi.co/json/', {
      cache: 'no-store',
    })

    if (!response.ok) {
      console.error('[GEO-DETECTION] API request failed, status:', response.status)
      console.log('[GEO-DETECTION] Defaulting to ROW (USD)')
      return 'row'
    }

    const data = await response.json()
    const countryCode = data.country_code
    
    console.log('[GEO-DETECTION] Detected country:', countryCode, data.country_name)

    // India users get India pricing
    if (countryCode === 'IN') {
      console.log('[GEO-DETECTION] User in India → INR pricing')
      return 'india'
    }

    // Everyone else gets ROW pricing
    console.log('[GEO-DETECTION] User outside India → USD pricing')
    return 'row'
  } catch (error) {
    console.error('[GEO-DETECTION] Error during detection:', error)
    console.log('[GEO-DETECTION] Defaulting to ROW (USD)')
    // Default to ROW pricing on error
    return 'row'
  }
}

/**
 * Client-side region detection using browser APIs
 * Fallback if server-side detection fails
 */
export function detectRegionFromTimezone(): Region {
  try {
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone
    console.log('[GEO-DETECTION] Timezone fallback:', timezone)
    
    // Indian timezones
    if (timezone.includes('Kolkata') || timezone.includes('Calcutta')) {
      console.log('[GEO-DETECTION] Indian timezone detected → INR pricing')
      return 'india'
    }

    console.log('[GEO-DETECTION] Non-Indian timezone → USD pricing')
    return 'row'
  } catch (error) {
    console.error('[GEO-DETECTION] Timezone detection error:', error)
    console.log('[GEO-DETECTION] Defaulting to ROW (USD)')
    return 'row'
  }
}

/**
 * Get region from localStorage (user preference)
 * Only returns stored value if user explicitly set it
 */
export function getStoredRegion(): Region | null {
  if (typeof window === 'undefined') return null
  
  // Check if user explicitly set the region (not auto-detected)
  const userSet = localStorage.getItem('pricing_region_user_set')
  const stored = localStorage.getItem('pricing_region')
  
  console.log('[GEO-DETECTION] Checking stored preference:', { stored, userSet })
  
  if (userSet !== 'true') {
    console.log('[GEO-DETECTION] No user preference stored, will auto-detect')
    return null
  }
  
  if (stored === 'india' || stored === 'row') {
    console.log('[GEO-DETECTION] Using stored user preference:', stored)
    return stored
  }
  
  return null
}

/**
 * Store user's region preference (when user manually toggles)
 */
export function storeRegion(region: Region, userSet: boolean = false): void {
  if (typeof window === 'undefined') return
  localStorage.setItem('pricing_region', region)
  if (userSet) {
    localStorage.setItem('pricing_region_user_set', 'true')
  }
}

/**
 * Clear stored region to force re-detection
 */
export function clearStoredRegion(): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem('pricing_region')
  localStorage.removeItem('pricing_region_user_set')
}
