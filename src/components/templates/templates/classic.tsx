
import { cn } from '@/lib/utils'
import type { TemplateProps } from '../types'
import { ContactSection, ExperienceItem, EducationItem, SkillsSection, SectionHeader } from '../base-template'

export function ClassicTemplate({ data, className }: TemplateProps) {
  return (
    <div className={cn('bg-white text-black p-8 min-h-[1056px] w-[816px]', className)}>
      {/* Header */}
      <header className="text-center border-b-2 border-black pb-4 mb-6">
        <h1 className="text-3xl font-bold uppercase tracking-wide">{data.contact.name || 'Your Name'}</h1>
        <ContactSection contact={data.contact} layout="centered" className="mt-2 text-gray-600" />
      </header>

      {/* Summary */}
      {data.summary && (
        <section className="mb-6">
          <SectionHeader title="Professional Summary" variant="uppercase" />
          <p className="text-sm leading-relaxed">{data.summary}</p>
        </section>
      )}

      {/* Experience */}
      {data.experience.length > 0 && (
        <section className="mb-6">
          <SectionHeader title="Professional Experience" variant="uppercase" />
          {data.experience.map((exp) => (
            <ExperienceItem key={exp.id} exp={exp} />
          ))}
        </section>
      )}

      {/* Education */}
      {data.education.length > 0 && (
        <section className="mb-6">
          <SectionHeader title="Education" variant="uppercase" />
          {data.education.map((edu) => (
            <EducationItem key={edu.id} edu={edu} />
          ))}
        </section>
      )}

      {/* Skills */}
      {data.skills.length > 0 && (
        <section>
          <SectionHeader title="Skills" variant="uppercase" />
          <SkillsSection skills={data.skills} layout="inline" />
        </section>
      )}
    </div>
  )
}
