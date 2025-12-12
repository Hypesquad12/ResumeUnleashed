// Shared types for resume templates

export interface ContactInfo {
  name: string
  email: string
  phone: string
  linkedin: string
  location: string
  website?: string
}

export interface Experience {
  id: string
  company: string
  position: string
  location: string
  startDate: string
  endDate: string
  current: boolean
  description: string
}

export interface Education {
  id: string
  institution: string
  degree: string
  field: string
  startDate: string
  endDate: string
  gpa: string
}

export interface ResumeData {
  id: string
  title: string
  contact: ContactInfo
  summary: string
  experience: Experience[]
  education: Education[]
  skills: string[]
  template?: string
  photo_url?: string
}

export interface TemplateProps {
  data: ResumeData
  className?: string
}

export interface TemplateInfo {
  id: string
  name: string
  description: string
  category: 'professional' | 'creative' | 'modern' | 'minimal' | 'executive'
  isPremium: boolean
  color: string
  thumbnail?: string
}

// Template registry
export const TEMPLATES: TemplateInfo[] = [
  // Professional Templates
  {
    id: 'classic',
    name: 'Classic',
    description: 'Traditional and timeless design',
    category: 'professional',
    isPremium: false,
    color: 'from-slate-600 to-slate-800',
  },
  {
    id: 'professional',
    name: 'Professional',
    description: 'Clean corporate layout',
    category: 'professional',
    isPremium: false,
    color: 'from-blue-600 to-blue-800',
  },
  {
    id: 'executive',
    name: 'Executive',
    description: 'Sophisticated senior-level design',
    category: 'executive',
    isPremium: true,
    color: 'from-amber-600 to-amber-800',
  },
  // Modern Templates
  {
    id: 'modern',
    name: 'Modern',
    description: 'Contemporary and fresh look',
    category: 'modern',
    isPremium: false,
    color: 'from-teal-500 to-cyan-600',
  },
  {
    id: 'sleek',
    name: 'Sleek',
    description: 'Streamlined modern aesthetic',
    category: 'modern',
    isPremium: false,
    color: 'from-indigo-500 to-purple-600',
  },
  {
    id: 'tech',
    name: 'Tech',
    description: 'Perfect for tech industry',
    category: 'modern',
    isPremium: true,
    color: 'from-green-500 to-emerald-600',
  },
  // Creative Templates
  {
    id: 'creative',
    name: 'Creative',
    description: 'Stand out with unique design',
    category: 'creative',
    isPremium: false,
    color: 'from-purple-500 to-pink-500',
  },
  {
    id: 'bold',
    name: 'Bold',
    description: 'Make a strong impression',
    category: 'creative',
    isPremium: false,
    color: 'from-red-500 to-rose-600',
  },
  {
    id: 'artistic',
    name: 'Artistic',
    description: 'For creative professionals',
    category: 'creative',
    isPremium: true,
    color: 'from-fuchsia-500 to-violet-600',
  },
  // Minimal Templates
  {
    id: 'minimal',
    name: 'Minimal',
    description: 'Clean and simple',
    category: 'minimal',
    isPremium: false,
    color: 'from-gray-400 to-gray-600',
  },
  {
    id: 'clean',
    name: 'Clean',
    description: 'Maximum white space',
    category: 'minimal',
    isPremium: false,
    color: 'from-zinc-400 to-zinc-600',
  },
  {
    id: 'elegant',
    name: 'Elegant',
    description: 'Refined minimalist style',
    category: 'minimal',
    isPremium: true,
    color: 'from-stone-500 to-stone-700',
  },
  // Executive Templates
  {
    id: 'corporate',
    name: 'Corporate',
    description: 'Business-focused layout',
    category: 'executive',
    isPremium: false,
    color: 'from-sky-600 to-blue-700',
  },
  {
    id: 'premium',
    name: 'Premium',
    description: 'Luxury executive design',
    category: 'executive',
    isPremium: true,
    color: 'from-yellow-600 to-orange-600',
  },
  {
    id: 'distinguished',
    name: 'Distinguished',
    description: 'For senior executives',
    category: 'executive',
    isPremium: true,
    color: 'from-emerald-600 to-teal-700',
  },
]

export const getTemplateById = (id: string): TemplateInfo | undefined => {
  return TEMPLATES.find(t => t.id === id)
}

export const getTemplatesByCategory = (category: TemplateInfo['category']): TemplateInfo[] => {
  return TEMPLATES.filter(t => t.category === category)
}

export const getFreeTemplates = (): TemplateInfo[] => {
  return TEMPLATES.filter(t => !t.isPremium)
}

export const getPremiumTemplates = (): TemplateInfo[] => {
  return TEMPLATES.filter(t => t.isPremium)
}
