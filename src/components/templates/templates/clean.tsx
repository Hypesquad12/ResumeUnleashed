
import { cn } from '@/lib/utils'
import type { TemplateProps } from '../types'
import { formatDate } from '../base-template'

export function CleanTemplate({ data, className }: TemplateProps) {
  return (
    <div className={cn('bg-white text-gray-800 min-h-[1056px] w-[816px] p-10', className)}>
      {/* Header */}
      <header className="mb-10">
        <h1 className="text-3xl font-medium text-gray-900">{data.contact.name || 'Your Name'}</h1>
        <div className="flex gap-3 mt-2 text-sm text-gray-500">
          {data.contact.email && <span>{data.contact.email}</span>}
          {data.contact.phone && <span>|</span>}
          {data.contact.phone && <span>{data.contact.phone}</span>}
          {data.contact.location && <span>|</span>}
          {data.contact.location && <span>{data.contact.location}</span>}
        </div>
      </header>

      {/* Summary */}
      {data.summary && (
        <section className="mb-8">
          <p className="text-gray-600 leading-relaxed">{data.summary}</p>
        </section>
      )}

      {/* Experience */}
      {data.experience.length > 0 && (
        <section className="mb-8">
          <h2 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-4 pb-2 border-b">
            Experience
          </h2>
          {data.experience.map((exp) => (
            <div key={exp.id} className="mb-6">
              <div className="flex justify-between">
                <h3 className="font-medium text-gray-900">{exp.position}</h3>
                <span className="text-sm text-gray-400">
                  {formatDate(exp.startDate)} – {exp.current ? 'Present' : formatDate(exp.endDate)}
                </span>
              </div>
              <p className="text-gray-600">{exp.company}</p>
              {exp.description && (
                <p className="mt-2 text-sm text-gray-500">{exp.description}</p>
              )}
            </div>
          ))}
        </section>
      )}

      {/* Education */}
      {data.education.length > 0 && (
        <section className="mb-8">
          <h2 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-4 pb-2 border-b">
            Education
          </h2>
          {data.education.map((edu) => (
            <div key={edu.id} className="mb-4">
              <div className="flex justify-between">
                <h3 className="font-medium text-gray-900">{edu.degree}{edu.field && `, ${edu.field}`}</h3>
                <span className="text-sm text-gray-400">{formatDate(edu.endDate)}</span>
              </div>
              <p className="text-gray-600">{edu.institution}</p>
            </div>
          ))}
        </section>
      )}

      {/* Skills */}
      {data.skills.length > 0 && (
        <section>
          <h2 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-4 pb-2 border-b">
            Skills
          </h2>
          <p className="text-gray-600">{data.skills.join(' • ')}</p>
        </section>
      )}
    </div>
  )
}
