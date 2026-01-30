
import { CardTemplate, CARD_TEMPLATES } from './index'
import type { CardData } from './types'

const sampleCardData: CardData = {
  name: 'John Doe',
  title: 'Software Engineer',
  company: 'Tech Corp',
  email: 'john@example.com',
  phone: '+1 (555) 123-4567',
  website: 'johndoe.com',
  linkedin: 'linkedin.com/in/johndoe',
  github: 'github.com/johndoe',
  theme_color: '#1a1a2e',
}

interface CardThumbnailProps {
  templateId: string
  themeColor?: string
  className?: string
}

export function CardThumbnail({ templateId, themeColor, className }: CardThumbnailProps) {
  const data = { ...sampleCardData, theme_color: themeColor || sampleCardData.theme_color }
  
  return (
    <div className={`transform scale-[0.45] origin-top-left ${className}`}>
      <CardTemplate templateId={templateId} data={data} showQR={true} />
    </div>
  )
}
