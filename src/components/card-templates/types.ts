export interface CardData {
  name: string
  title?: string
  company?: string
  email?: string
  phone?: string
  website?: string
  linkedin?: string
  github?: string
  twitter?: string
  theme_color?: string
  qr_code_url?: string
}

export interface CardTemplateProps {
  data: CardData
  className?: string
  showQR?: boolean
}

export interface CardTemplateInfo {
  id: string
  name: string
  description: string
  isPremium: boolean
}
