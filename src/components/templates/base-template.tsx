
import { cn } from '@/lib/utils'
import type { ResumeData, ContactInfo, Experience, Education } from './types'
import { Mail, Phone, MapPin, Linkedin, Globe } from 'lucide-react'

// Helper to format date
export const formatDate = (dateStr: string): string => {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
}

// Contact Info Component
export const ContactSection = ({ 
  contact, 
  layout = 'horizontal',
  className 
}: { 
  contact: ContactInfo
  layout?: 'horizontal' | 'vertical' | 'centered'
  className?: string 
}) => {
  const items = [
    { icon: Mail, value: contact.email },
    { icon: Phone, value: contact.phone },
    { icon: MapPin, value: contact.location },
    { icon: Linkedin, value: contact.linkedin?.replace('https://linkedin.com/in/', '') },
    { icon: Globe, value: contact.website?.replace('https://', '') },
  ].filter(item => item.value)

  if (layout === 'centered') {
    return (
      <div className={cn('flex flex-wrap justify-center gap-4 text-sm', className)}>
        {items.map((item, i) => (
          <span key={i} className="flex items-center gap-1">
            <item.icon className="h-3 w-3" />
            {item.value}
          </span>
        ))}
      </div>
    )
  }

  if (layout === 'vertical') {
    return (
      <div className={cn('space-y-1 text-sm', className)}>
        {items.map((item, i) => (
          <div key={i} className="flex items-center gap-2">
            <item.icon className="h-3 w-3" />
            <span>{item.value}</span>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className={cn('flex flex-wrap gap-4 text-sm', className)}>
      {items.map((item, i) => (
        <span key={i} className="flex items-center gap-1">
          <item.icon className="h-3 w-3" />
          {item.value}
        </span>
      ))}
    </div>
  )
}

// Experience Item Component
export const ExperienceItem = ({ 
  exp, 
  showBullets = true,
  className 
}: { 
  exp: Experience
  showBullets?: boolean
  className?: string 
}) => {
  const bullets = (exp.description && typeof exp.description === 'string' 
    ? exp.description.split('\n') 
    : []).filter(b => b.trim())
  
  return (
    <div className={cn('mb-4', className)}>
      <div className="flex justify-between items-start">
        <div>
          <h4 className="font-semibold">{exp.position}</h4>
          <p className="text-muted-foreground">{exp.company}{exp.location && ` • ${exp.location}`}</p>
        </div>
        <span className="text-sm text-muted-foreground whitespace-nowrap">
          {formatDate(exp.startDate)} - {exp.current ? 'Present' : formatDate(exp.endDate)}
        </span>
      </div>
      {showBullets && bullets.length > 0 ? (
        <ul className="mt-2 space-y-1 text-sm list-disc list-inside">
          {bullets.map((bullet, i) => (
            <li key={i}>{bullet.replace(/^[-•]\s*/, '')}</li>
          ))}
        </ul>
      ) : exp.description && (
        <p className="mt-2 text-sm">{exp.description}</p>
      )}
    </div>
  )
}

// Education Item Component
export const EducationItem = ({ 
  edu,
  compact = false,
  className 
}: { 
  edu: Education
  compact?: boolean
  className?: string 
}) => {
  return (
    <div className={cn('mb-3', className)}>
      <div className="flex justify-between items-start">
        <div>
          <h4 className="font-semibold">{edu.degree}{edu.field && ` in ${edu.field}`}</h4>
          <p className="text-muted-foreground">{edu.institution}</p>
        </div>
        {!compact && (
          <span className="text-sm text-muted-foreground whitespace-nowrap">
            {formatDate(edu.startDate)} - {formatDate(edu.endDate)}
          </span>
        )}
      </div>
      {edu.gpa && <p className="text-sm text-muted-foreground">GPA: {edu.gpa}</p>}
    </div>
  )
}

// Skills Section Component
export const SkillsSection = ({ 
  skills, 
  layout = 'tags',
  className 
}: { 
  skills: string[]
  layout?: 'tags' | 'inline' | 'list' | 'columns'
  className?: string 
}) => {
  if (layout === 'tags') {
    return (
      <div className={cn('flex flex-wrap gap-2', className)}>
        {skills.map((skill, i) => (
          <span key={i} className="px-2 py-1 bg-muted rounded text-sm">
            {skill}
          </span>
        ))}
      </div>
    )
  }

  if (layout === 'inline') {
    return (
      <p className={cn('text-sm', className)}>
        {skills.join(' • ')}
      </p>
    )
  }

  if (layout === 'columns') {
    const midpoint = Math.ceil(skills.length / 2)
    return (
      <div className={cn('grid grid-cols-2 gap-x-4 gap-y-1 text-sm', className)}>
        {skills.map((skill, i) => (
          <span key={i}>• {skill}</span>
        ))}
      </div>
    )
  }

  return (
    <ul className={cn('space-y-1 text-sm', className)}>
      {skills.map((skill, i) => (
        <li key={i}>• {skill}</li>
      ))}
    </ul>
  )
}

// Section Header Component
export const SectionHeader = ({ 
  title, 
  variant = 'default',
  className 
}: { 
  title: string
  variant?: 'default' | 'underline' | 'background' | 'border-left' | 'uppercase'
  className?: string 
}) => {
  const variants = {
    default: 'text-lg font-bold mb-3',
    underline: 'text-lg font-bold mb-3 border-b-2 border-primary pb-1',
    background: 'text-lg font-bold mb-3 bg-muted px-2 py-1 -mx-2',
    'border-left': 'text-lg font-bold mb-3 border-l-4 border-primary pl-2',
    uppercase: 'text-sm font-bold mb-3 uppercase tracking-wider text-muted-foreground',
  }

  return <h3 className={cn(variants[variant], className)}>{title}</h3>
}
