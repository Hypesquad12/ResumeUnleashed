
import { cn } from '@/lib/utils'
import type { TemplateProps } from '../types'
import { formatDate } from '../base-template'

export function ArtisticTemplate({ data, className }: TemplateProps) {
  return (
    <div className={cn('bg-gradient-to-br from-fuchsia-50 to-violet-50 text-gray-800 min-h-[1056px] w-[816px] p-8', className)}>
      {/* Artistic Header */}
      <header className="text-center mb-8 relative">
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-32 h-32 bg-gradient-to-br from-fuchsia-400 to-violet-500 rounded-full opacity-20 blur-2xl" />
        <h1 className="text-5xl font-light tracking-wide bg-gradient-to-r from-fuchsia-600 to-violet-600 bg-clip-text text-transparent relative">
          {data.contact.name || 'Your Name'}
        </h1>
        <div className="flex justify-center gap-4 mt-4 text-sm text-gray-500">
          {data.contact.email && <span>{data.contact.email}</span>}
          {data.contact.phone && <span>•</span>}
          {data.contact.phone && <span>{data.contact.phone}</span>}
          {data.contact.location && <span>•</span>}
          {data.contact.location && <span>{data.contact.location}</span>}
        </div>
        <div className="mt-4 flex justify-center">
          <div className="w-24 h-0.5 bg-gradient-to-r from-fuchsia-400 to-violet-500 rounded-full" />
        </div>
      </header>

      {/* Summary */}
      {data.summary && (
        <section className="mb-8 text-center max-w-2xl mx-auto">
          <p className="text-gray-600 italic leading-relaxed">&ldquo;{data.summary}&rdquo;</p>
        </section>
      )}

      <div className="grid grid-cols-5 gap-8">
        {/* Main Content */}
        <div className="col-span-3 space-y-8">
          {/* Experience */}
          {data.experience.length > 0 && (
            <section>
              <h2 className="text-lg font-light text-fuchsia-600 uppercase tracking-widest mb-4">Experience</h2>
              {data.experience.map((exp, i) => (
                <div key={exp.id} className="mb-6 relative">
                  <div className="absolute -left-4 top-2 w-2 h-2 bg-gradient-to-br from-fuchsia-400 to-violet-500 rounded-full" />
                  <h3 className="font-medium text-lg">{exp.position}</h3>
                  <p className="text-fuchsia-600">{exp.company}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {formatDate(exp.startDate)} — {exp.current ? 'Present' : formatDate(exp.endDate)}
                  </p>
                  {exp.description && (
                    <p className="mt-2 text-sm text-gray-600">{exp.description}</p>
                  )}
                </div>
              ))}
            </section>
          )}

          {/* Education */}
          {data.education.length > 0 && (
            <section>
              <h2 className="text-lg font-light text-fuchsia-600 uppercase tracking-widest mb-4">Education</h2>
              {data.education.map((edu) => (
                <div key={edu.id} className="mb-4 relative">
                  <div className="absolute -left-4 top-2 w-2 h-2 bg-gradient-to-br from-fuchsia-400 to-violet-500 rounded-full" />
                  <h3 className="font-medium">{edu.degree}</h3>
                  <p className="text-fuchsia-600 text-sm">{edu.institution}</p>
                  {edu.field && <p className="text-xs text-gray-500">{edu.field}</p>}
                </div>
              ))}
            </section>
          )}
        </div>

        {/* Sidebar */}
        <div className="col-span-2">
          {/* Skills */}
          {data.skills.length > 0 && (
            <section className="bg-white/50 backdrop-blur rounded-2xl p-6 shadow-lg shadow-fuchsia-100">
              <h2 className="text-lg font-light text-fuchsia-600 uppercase tracking-widest mb-4">Expertise</h2>
              <div className="space-y-3">
                {data.skills.map((skill, i) => (
                  <div key={i} className="relative">
                    <span className="text-sm">{skill}</span>
                    <div className="mt-1 h-1 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-fuchsia-400 to-violet-500 rounded-full"
                        style={{ width: `${90 - (i * 5)}%` }}
                      />
                    </div>
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
