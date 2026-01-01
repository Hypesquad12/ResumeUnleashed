import { Region } from './pricing-config'

/**
 * Detect user's region based on IP geolocation
 * Uses a free IP geolocation API
 */
export async function detectUserRegion(): Promise<Region> {
  try {
    // Use ipapi.co for free IP geolocation (no API key required)
    const response = await fetch('https://ipapi.co/json/', {
      cache: 'no-store',
    })

    if (!response.ok) {
      console.error('Geo-detection failed, defaulting to ROW')
      return 'row'
    }

    const data = await response.json()
    const countryCode = data.country_code

    // India users get India pricing
    if (countryCode === 'IN') {
      return 'india'
    }

    // Everyone else gets ROW pricing
    return 'row'
  } catch (error) {
    console.error('Geo-detection error:', error)
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
    
    // Indian timezones
    if (timezone.includes('Kolkata') || timezone.includes('Calcutta')) {
      return 'india'
    }

    return 'row'
  } catch (error) {
    console.error('Timezone detection error:', error)
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
  if (userSet !== 'true') return null
  
  const stored = localStorage.getItem('pricing_region')
  if (stored === 'india' || stored === 'row') {
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
