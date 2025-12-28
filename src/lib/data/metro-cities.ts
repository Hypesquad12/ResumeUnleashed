export interface MetroCity {
  value: string
  label: string
  country: string
  region: string
  multiplier: number
}

export const metroCities: MetroCity[] = [
  // North America
  { value: 'sf-bay', label: 'San Francisco Bay Area', country: 'USA', region: 'North America', multiplier: 1.35 },
  { value: 'nyc', label: 'New York City', country: 'USA', region: 'North America', multiplier: 1.30 },
  { value: 'seattle', label: 'Seattle', country: 'USA', region: 'North America', multiplier: 1.25 },
  { value: 'boston', label: 'Boston', country: 'USA', region: 'North America', multiplier: 1.22 },
  { value: 'los-angeles', label: 'Los Angeles', country: 'USA', region: 'North America', multiplier: 1.20 },
  { value: 'washington-dc', label: 'Washington DC', country: 'USA', region: 'North America', multiplier: 1.18 },
  { value: 'austin', label: 'Austin', country: 'USA', region: 'North America', multiplier: 1.10 },
  { value: 'chicago', label: 'Chicago', country: 'USA', region: 'North America', multiplier: 1.05 },
  { value: 'denver', label: 'Denver', country: 'USA', region: 'North America', multiplier: 1.05 },
  { value: 'atlanta', label: 'Atlanta', country: 'USA', region: 'North America', multiplier: 1.00 },
  { value: 'miami', label: 'Miami', country: 'USA', region: 'North America', multiplier: 1.00 },
  { value: 'dallas', label: 'Dallas', country: 'USA', region: 'North America', multiplier: 0.98 },
  { value: 'phoenix', label: 'Phoenix', country: 'USA', region: 'North America', multiplier: 0.95 },
  { value: 'toronto', label: 'Toronto', country: 'Canada', region: 'North America', multiplier: 1.10 },
  { value: 'vancouver', label: 'Vancouver', country: 'Canada', region: 'North America', multiplier: 1.08 },
  { value: 'montreal', label: 'Montreal', country: 'Canada', region: 'North America', multiplier: 1.00 },
  { value: 'mexico-city', label: 'Mexico City', country: 'Mexico', region: 'North America', multiplier: 0.55 },

  // Europe
  { value: 'london', label: 'London', country: 'UK', region: 'Europe', multiplier: 1.25 },
  { value: 'zurich', label: 'Zurich', country: 'Switzerland', region: 'Europe', multiplier: 1.40 },
  { value: 'geneva', label: 'Geneva', country: 'Switzerland', region: 'Europe', multiplier: 1.38 },
  { value: 'dublin', label: 'Dublin', country: 'Ireland', region: 'Europe', multiplier: 1.20 },
  { value: 'amsterdam', label: 'Amsterdam', country: 'Netherlands', region: 'Europe', multiplier: 1.18 },
  { value: 'paris', label: 'Paris', country: 'France', region: 'Europe', multiplier: 1.15 },
  { value: 'berlin', label: 'Berlin', country: 'Germany', region: 'Europe', multiplier: 1.10 },
  { value: 'munich', label: 'Munich', country: 'Germany', region: 'Europe', multiplier: 1.12 },
  { value: 'frankfurt', label: 'Frankfurt', country: 'Germany', region: 'Europe', multiplier: 1.10 },
  { value: 'stockholm', label: 'Stockholm', country: 'Sweden', region: 'Europe', multiplier: 1.15 },
  { value: 'copenhagen', label: 'Copenhagen', country: 'Denmark', region: 'Europe', multiplier: 1.18 },
  { value: 'oslo', label: 'Oslo', country: 'Norway', region: 'Europe', multiplier: 1.20 },
  { value: 'helsinki', label: 'Helsinki', country: 'Finland', region: 'Europe', multiplier: 1.10 },
  { value: 'barcelona', label: 'Barcelona', country: 'Spain', region: 'Europe', multiplier: 0.95 },
  { value: 'madrid', label: 'Madrid', country: 'Spain', region: 'Europe', multiplier: 0.95 },
  { value: 'milan', label: 'Milan', country: 'Italy', region: 'Europe', multiplier: 1.00 },
  { value: 'rome', label: 'Rome', country: 'Italy', region: 'Europe', multiplier: 0.95 },
  { value: 'brussels', label: 'Brussels', country: 'Belgium', region: 'Europe', multiplier: 1.08 },
  { value: 'vienna', label: 'Vienna', country: 'Austria', region: 'Europe', multiplier: 1.05 },
  { value: 'prague', label: 'Prague', country: 'Czech Republic', region: 'Europe', multiplier: 0.75 },
  { value: 'warsaw', label: 'Warsaw', country: 'Poland', region: 'Europe', multiplier: 0.65 },
  { value: 'lisbon', label: 'Lisbon', country: 'Portugal', region: 'Europe', multiplier: 0.80 },

  // Asia-Pacific
  { value: 'singapore', label: 'Singapore', country: 'Singapore', region: 'Asia-Pacific', multiplier: 1.20 },
  { value: 'hong-kong', label: 'Hong Kong', country: 'Hong Kong', region: 'Asia-Pacific', multiplier: 1.18 },
  { value: 'tokyo', label: 'Tokyo', country: 'Japan', region: 'Asia-Pacific', multiplier: 1.15 },
  { value: 'sydney', label: 'Sydney', country: 'Australia', region: 'Asia-Pacific', multiplier: 1.15 },
  { value: 'melbourne', label: 'Melbourne', country: 'Australia', region: 'Asia-Pacific', multiplier: 1.12 },
  { value: 'auckland', label: 'Auckland', country: 'New Zealand', region: 'Asia-Pacific', multiplier: 1.00 },
  { value: 'shanghai', label: 'Shanghai', country: 'China', region: 'Asia-Pacific', multiplier: 0.85 },
  { value: 'beijing', label: 'Beijing', country: 'China', region: 'Asia-Pacific', multiplier: 0.85 },
  { value: 'shenzhen', label: 'Shenzhen', country: 'China', region: 'Asia-Pacific', multiplier: 0.85 },
  { value: 'seoul', label: 'Seoul', country: 'South Korea', region: 'Asia-Pacific', multiplier: 0.95 },
  { value: 'bangalore', label: 'Bangalore', country: 'India', region: 'Asia-Pacific', multiplier: 0.45 },
  { value: 'mumbai', label: 'Mumbai', country: 'India', region: 'Asia-Pacific', multiplier: 0.45 },
  { value: 'delhi', label: 'Delhi', country: 'India', region: 'Asia-Pacific', multiplier: 0.42 },
  { value: 'hyderabad', label: 'Hyderabad', country: 'India', region: 'Asia-Pacific', multiplier: 0.40 },
  { value: 'pune', label: 'Pune', country: 'India', region: 'Asia-Pacific', multiplier: 0.40 },
  { value: 'chennai', label: 'Chennai', country: 'India', region: 'Asia-Pacific', multiplier: 0.38 },
  { value: 'kuala-lumpur', label: 'Kuala Lumpur', country: 'Malaysia', region: 'Asia-Pacific', multiplier: 0.55 },
  { value: 'bangkok', label: 'Bangkok', country: 'Thailand', region: 'Asia-Pacific', multiplier: 0.50 },
  { value: 'jakarta', label: 'Jakarta', country: 'Indonesia', region: 'Asia-Pacific', multiplier: 0.45 },
  { value: 'manila', label: 'Manila', country: 'Philippines', region: 'Asia-Pacific', multiplier: 0.40 },
  { value: 'ho-chi-minh', label: 'Ho Chi Minh City', country: 'Vietnam', region: 'Asia-Pacific', multiplier: 0.38 },
  { value: 'taipei', label: 'Taipei', country: 'Taiwan', region: 'Asia-Pacific', multiplier: 0.75 },

  // Middle East & Africa
  { value: 'dubai', label: 'Dubai', country: 'UAE', region: 'Middle East', multiplier: 1.10 },
  { value: 'abu-dhabi', label: 'Abu Dhabi', country: 'UAE', region: 'Middle East', multiplier: 1.08 },
  { value: 'tel-aviv', label: 'Tel Aviv', country: 'Israel', region: 'Middle East', multiplier: 1.05 },
  { value: 'riyadh', label: 'Riyadh', country: 'Saudi Arabia', region: 'Middle East', multiplier: 0.95 },
  { value: 'doha', label: 'Doha', country: 'Qatar', region: 'Middle East', multiplier: 1.00 },
  { value: 'cairo', label: 'Cairo', country: 'Egypt', region: 'Africa', multiplier: 0.35 },
  { value: 'johannesburg', label: 'Johannesburg', country: 'South Africa', region: 'Africa', multiplier: 0.55 },
  { value: 'cape-town', label: 'Cape Town', country: 'South Africa', region: 'Africa', multiplier: 0.55 },
  { value: 'nairobi', label: 'Nairobi', country: 'Kenya', region: 'Africa', multiplier: 0.40 },
  { value: 'lagos', label: 'Lagos', country: 'Nigeria', region: 'Africa', multiplier: 0.38 },

  // South America
  { value: 'sao-paulo', label: 'São Paulo', country: 'Brazil', region: 'South America', multiplier: 0.50 },
  { value: 'rio-de-janeiro', label: 'Rio de Janeiro', country: 'Brazil', region: 'South America', multiplier: 0.48 },
  { value: 'buenos-aires', label: 'Buenos Aires', country: 'Argentina', region: 'South America', multiplier: 0.45 },
  { value: 'santiago', label: 'Santiago', country: 'Chile', region: 'South America', multiplier: 0.52 },
  { value: 'bogota', label: 'Bogotá', country: 'Colombia', region: 'South America', multiplier: 0.42 },
  { value: 'lima', label: 'Lima', country: 'Peru', region: 'South America', multiplier: 0.40 },

  // Remote
  { value: 'remote-us', label: 'Remote (US)', country: 'USA', region: 'Remote', multiplier: 1.00 },
  { value: 'remote-eu', label: 'Remote (Europe)', country: 'Europe', region: 'Remote', multiplier: 0.95 },
  { value: 'remote-apac', label: 'Remote (Asia-Pacific)', country: 'Asia', region: 'Remote', multiplier: 0.75 },
  { value: 'remote-global', label: 'Remote (Global)', country: 'Global', region: 'Remote', multiplier: 0.85 },
]

export const getRegions = (): string[] => {
  return Array.from(new Set(metroCities.map(city => city.region))).sort()
}

export const getCitiesByRegion = (region: string): MetroCity[] => {
  return metroCities.filter(city => city.region === region)
}

export const getCityByValue = (value: string): MetroCity | undefined => {
  return metroCities.find(city => city.value === value)
}
