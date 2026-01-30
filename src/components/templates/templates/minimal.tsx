
import { cn } from '@/lib/utils'
import type { TemplateProps } from '../types'
import { formatDate } from '../base-template'

export function MinimalTemplate({ data, className }: TemplateProps) {
  return (
    <div className={cn('bg-white text-black p-12 min-h-[1056px] w-[816px]', className)}>
      {/* Header */}
      <header className="mb-8">
        <h1 className="text-4xl font-light tracking-tight">{data.contact.name || 'Your Name'}</h1>
        <div className="flex gap-4 mt-2 text-sm text-gray-500">
          {data.contact.email && <span>{data.contact.email}</span>}
          {data.contact.phone && <span>{data.contact.phone}</span>}
          {data.contact.location && <span>{data.contact.location}</span>}
        </div>
      </header>

      {/* Summary */}
      {data.summary && (
        <section className="mb-8">
          <p className="text-sm leading-relaxed text-gray-700">{data.summary}</p>
        </section>
      )}

      {/* Experience */}
      {data.experience.length > 0 && (
        <section className="mb-8">
          <h2 className="text-xs uppercase tracking-widest text-gray-400 mb-4">Experience</h2>
          {data.experience.map((exp) => (
            <div key={exp.id} className="mb-5">
              <div className="flex justify-between">
                <div>
                  <h3 className="font-medium">{exp.position}</h3>
                  <p className="text-sm text-gray-500">{exp.company}</p>
                </div>
                <span className="text-sm text-gray-400">
                  {formatDate(exp.startDate)} — {exp.current ? 'Present' : formatDate(exp.endDate)}
                </span>
              </div>
              {exp.description && typeof exp.description === 'string' && (
                <ul className="mt-2 text-sm text-gray-600 space-y-1 list-none">
                  {exp.description.split('\n').filter(b => b.trim()).map((bullet, i) => (
                    <li key={i} className="flex gap-2">
                      <span className="text-gray-400">•</span>
                      <span>{bullet.replace(/^[-•]\s*/, '')}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </section>
      )}

      {/* Education */}
      {data.education.length > 0 && (
        <section className="mb-8">
          <h2 className="text-xs uppercase tracking-widest text-gray-400 mb-4">Education</h2>
          {data.education.map((edu) => (
            <div key={edu.id} className="mb-3">
              <div className="flex justify-between">
                <div>
                  <h3 className="font-medium">{edu.degree}{edu.field && `, ${edu.field}`}</h3>
                  <p className="text-sm text-gray-500">{edu.institution}</p>
                </div>
                <span className="text-sm text-gray-400">{formatDate(edu.endDate)}</span>
              </div>
            </div>
          ))}
        </section>
      )}

      {/* Skills */}
      {data.skills.length > 0 && (
        <section>
          <h2 className="text-xs uppercase tracking-widest text-gray-400 mb-4">Skills</h2>
          <p className="text-sm text-gray-600">{data.skills.join(' · ')}</p>
        </section>
      )}
    </div>
  )
}
