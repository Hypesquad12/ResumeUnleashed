
import { cn } from '@/lib/utils'
import type { TemplateProps } from '../types'
import { formatDate } from '../base-template'

export function ElegantTemplate({ data, className }: TemplateProps) {
  return (
    <div className={cn('bg-stone-50 text-stone-800 min-h-[1056px] w-[816px]', className)}>
      {/* Elegant Header */}
      <header className="bg-stone-800 text-stone-50 p-10 text-center">
        <h1 className="text-4xl font-serif tracking-wide">{data.contact.name || 'Your Name'}</h1>
        <div className="flex justify-center gap-6 mt-4 text-sm text-stone-300">
          {data.contact.email && <span>{data.contact.email}</span>}
          {data.contact.phone && <span>{data.contact.phone}</span>}
          {data.contact.location && <span>{data.contact.location}</span>}
        </div>
      </header>

      <div className="p-10">
        {/* Summary */}
        {data.summary && (
          <section className="mb-10 text-center">
            <div className="flex items-center justify-center gap-4 mb-4">
              <div className="w-12 h-px bg-stone-300" />
              <span className="text-xs uppercase tracking-widest text-stone-400">Profile</span>
              <div className="w-12 h-px bg-stone-300" />
            </div>
            <p className="text-stone-600 leading-relaxed max-w-2xl mx-auto font-serif italic">
              {data.summary}
            </p>
          </section>
        )}

        {/* Experience */}
        {data.experience.length > 0 && (
          <section className="mb-10">
            <div className="flex items-center justify-center gap-4 mb-6">
              <div className="w-12 h-px bg-stone-300" />
              <span className="text-xs uppercase tracking-widest text-stone-400">Experience</span>
              <div className="w-12 h-px bg-stone-300" />
            </div>
            {data.experience.map((exp) => (
              <div key={exp.id} className="mb-6 text-center">
                <h3 className="font-serif text-xl text-stone-800">{exp.position}</h3>
                <p className="text-stone-500">{exp.company}</p>
                <p className="text-xs text-stone-400 mt-1">
                  {formatDate(exp.startDate)} — {exp.current ? 'Present' : formatDate(exp.endDate)}
                </p>
                {exp.description && (
                  <p className="mt-3 text-sm text-stone-600 max-w-xl mx-auto">{exp.description}</p>
                )}
              </div>
            ))}
          </section>
        )}

        <div className="grid grid-cols-2 gap-10">
          {/* Education */}
          {data.education.length > 0 && (
            <section>
              <div className="flex items-center gap-4 mb-6">
                <div className="w-8 h-px bg-stone-300" />
                <span className="text-xs uppercase tracking-widest text-stone-400">Education</span>
              </div>
              {data.education.map((edu) => (
                <div key={edu.id} className="mb-4">
                  <h3 className="font-serif text-stone-800">{edu.degree}</h3>
                  <p className="text-sm text-stone-500">{edu.institution}</p>
                  {edu.field && <p className="text-xs text-stone-400">{edu.field}</p>}
                </div>
              ))}
            </section>
          )}

          {/* Skills */}
          {data.skills.length > 0 && (
            <section>
              <div className="flex items-center gap-4 mb-6">
                <div className="w-8 h-px bg-stone-300" />
                <span className="text-xs uppercase tracking-widest text-stone-400">Expertise</span>
              </div>
              <div className="space-y-2">
                {data.skills.map((skill, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-1 h-1 bg-stone-400 rounded-full" />
                    <span className="text-sm text-stone-600">{skill}</span>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  )
}
