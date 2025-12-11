'use client'

import type { TemplateProps, ResumeData } from './types'
import { ClassicTemplate } from './templates/classic'
import { ProfessionalTemplate } from './templates/professional'
import { ModernTemplate } from './templates/modern'
import { MinimalTemplate } from './templates/minimal'
import { CreativeTemplate } from './templates/creative'
import { ExecutiveTemplate } from './templates/executive'
import { SleekTemplate } from './templates/sleek'
import { TechTemplate } from './templates/tech'
import { BoldTemplate } from './templates/bold'
import { ArtisticTemplate } from './templates/artistic'
import { CleanTemplate } from './templates/clean'
import { ElegantTemplate } from './templates/elegant'
import { CorporateTemplate } from './templates/corporate'
import { PremiumTemplate } from './templates/premium'
import { DistinguishedTemplate } from './templates/distinguished'

// Export types
export * from './types'

// Template component map
const templateComponents: Record<string, React.ComponentType<TemplateProps>> = {
  classic: ClassicTemplate,
  professional: ProfessionalTemplate,
  modern: ModernTemplate,
  minimal: MinimalTemplate,
  creative: CreativeTemplate,
  executive: ExecutiveTemplate,
  sleek: SleekTemplate,
  tech: TechTemplate,
  bold: BoldTemplate,
  artistic: ArtisticTemplate,
  clean: CleanTemplate,
  elegant: ElegantTemplate,
  corporate: CorporateTemplate,
  premium: PremiumTemplate,
  distinguished: DistinguishedTemplate,
}

// Get template component by ID
export function getTemplateComponent(templateId: string): React.ComponentType<TemplateProps> {
  return templateComponents[templateId] || ClassicTemplate
}

// Render template by ID
export function ResumeTemplate({ 
  templateId, 
  data, 
  className 
}: { 
  templateId: string
  data: ResumeData
  className?: string 
}) {
  const Template = getTemplateComponent(templateId)
  return <Template data={data} className={className} />
}

// Export individual templates
export {
  ClassicTemplate,
  ProfessionalTemplate,
  ModernTemplate,
  MinimalTemplate,
  CreativeTemplate,
  ExecutiveTemplate,
  SleekTemplate,
  TechTemplate,
  BoldTemplate,
  ArtisticTemplate,
  CleanTemplate,
  ElegantTemplate,
  CorporateTemplate,
  PremiumTemplate,
  DistinguishedTemplate,
}
