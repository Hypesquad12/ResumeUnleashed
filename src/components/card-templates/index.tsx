'use client'

import type { CardTemplateProps, CardData, CardTemplateInfo } from './types'
import { ClassicCard } from './templates/classic-card'
import { ModernCard } from './templates/modern-card'
import { MinimalCard } from './templates/minimal-card'
import { GradientCard } from './templates/gradient-card'
import { SplitCard } from './templates/split-card'
import { ElegantCard } from './templates/elegant-card'
import { BoldCard } from './templates/bold-card'
import { TechCard } from './templates/tech-card'
import { CorporateCard } from './templates/corporate-card'
import { CreativeCard } from './templates/creative-card'
import { GlassCard } from './templates/glass-card'
import { VerticalCard } from './templates/vertical-card'
import { PremiumCard } from './templates/premium-card'
import { NeonCard } from './templates/neon-card'
import { WaveCard } from './templates/wave-card'

// Export types
export * from './types'

// Template component map
const cardTemplateComponents: Record<string, React.ComponentType<CardTemplateProps>> = {
  'classic-card': ClassicCard,
  'modern-card': ModernCard,
  'minimal-card': MinimalCard,
  'gradient-card': GradientCard,
  'split-card': SplitCard,
  'elegant-card': ElegantCard,
  'bold-card': BoldCard,
  'tech-card': TechCard,
  'corporate-card': CorporateCard,
  'creative-card': CreativeCard,
  'glass-card': GlassCard,
  'vertical-card': VerticalCard,
  'premium-card': PremiumCard,
  'neon-card': NeonCard,
  'wave-card': WaveCard,
}

// Card template info
export const CARD_TEMPLATES: CardTemplateInfo[] = [
  { id: 'classic-card', name: 'Classic', description: 'Traditional business card design', isPremium: false },
  { id: 'modern-card', name: 'Modern', description: 'Clean with accent bar', isPremium: false },
  { id: 'minimal-card', name: 'Minimal', description: 'Simple and elegant', isPremium: false },
  { id: 'gradient-card', name: 'Gradient', description: 'Smooth color transitions', isPremium: false },
  { id: 'split-card', name: 'Split', description: 'Two-tone split design', isPremium: false },
  { id: 'elegant-card', name: 'Elegant', description: 'Sophisticated serif style', isPremium: false },
  { id: 'bold-card', name: 'Bold', description: 'Strong typography focus', isPremium: false },
  { id: 'tech-card', name: 'Tech', description: 'Developer-friendly design', isPremium: false },
  { id: 'corporate-card', name: 'Corporate', description: 'Professional business style', isPremium: false },
  { id: 'creative-card', name: 'Creative', description: 'Playful with decorative elements', isPremium: false },
  { id: 'glass-card', name: 'Glass', description: 'Frosted glass effect', isPremium: true },
  { id: 'vertical-card', name: 'Vertical', description: 'Side panel layout', isPremium: true },
  { id: 'premium-card', name: 'Premium', description: 'Luxury gold accents', isPremium: true },
  { id: 'neon-card', name: 'Neon', description: 'Glowing neon borders', isPremium: true },
  { id: 'wave-card', name: 'Wave', description: 'Dynamic wave pattern', isPremium: true },
]

// Get template component by ID
export function getCardTemplateComponent(templateId: string): React.ComponentType<CardTemplateProps> {
  return cardTemplateComponents[templateId] || ClassicCard
}

// Get template info by ID
export function getCardTemplateById(templateId: string): CardTemplateInfo | undefined {
  return CARD_TEMPLATES.find(t => t.id === templateId)
}

// Render card template by ID
export function CardTemplate({ 
  templateId, 
  data, 
  className,
  showQR = true
}: { 
  templateId: string
  data: CardData
  className?: string
  showQR?: boolean
}) {
  const Template = getCardTemplateComponent(templateId)
  return <Template data={data} className={className} showQR={showQR} />
}

// Export individual templates
export {
  ClassicCard,
  ModernCard,
  MinimalCard,
  GradientCard,
  SplitCard,
  ElegantCard,
  BoldCard,
  TechCard,
  CorporateCard,
  CreativeCard,
  GlassCard,
  VerticalCard,
  PremiumCard,
  NeonCard,
  WaveCard,
}
