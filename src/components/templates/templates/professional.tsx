
import { cn } from '@/lib/utils'
import type { TemplateProps } from '../types'
import { ContactSection, ExperienceItem, EducationItem, SkillsSection, SectionHeader } from '../base-template'

export function ProfessionalTemplate({ data, className }: TemplateProps) {
  return (
    <div className={cn('bg-white text-black p-8 min-h-[1056px] w-[816px]', className)}>
      {/* Header */}
      <header className="mb-6">
        <h1 className="text-3xl font-bold text-blue-800">{data.contact.name || 'Your Name'}</h1>
        <ContactSection contact={data.contact} layout="horizontal" className="mt-2 text-gray-600" />
      </header>

      {/* Blue divider */}
      <div className="h-1 bg-blue-800 mb-6" />

      {/* Summary */}
      {data.summary && (
        <section className="mb-6">
          <SectionHeader title="Summary" variant="border-left" className="border-blue-800" />
          <p className="text-sm leading-relaxed">{data.summary}</p>
        </section>
      )}

      {/* Experience */}
      {data.experience.length > 0 && (
        <section className="mb-6">
          <SectionHeader title="Experience" variant="border-left" className="border-blue-800" />
          {data.experience.map((exp) => (
            <ExperienceItem key={exp.id} exp={exp} />
          ))}
        </section>
      )}

      {/* Education */}
      {data.education.length > 0 && (
        <section className="mb-6">
          <SectionHeader title="Education" variant="border-left" className="border-blue-800" />
          {data.education.map((edu) => (
            <EducationItem key={edu.id} edu={edu} />
          ))}
        </section>
      )}

      {/* Skills */}
      {data.skills.length > 0 && (
        <section>
          <SectionHeader title="Skills" variant="border-left" className="border-blue-800" />
          <SkillsSection skills={data.skills} layout="tags" />
        </section>
      )}
    </div>
  )
}
