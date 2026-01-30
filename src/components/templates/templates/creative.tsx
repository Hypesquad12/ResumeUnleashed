
import { cn } from '@/lib/utils'
import type { TemplateProps } from '../types'
import { formatDate } from '../base-template'
import { Mail, Phone, MapPin, Linkedin, Globe } from 'lucide-react'

export function CreativeTemplate({ data, className }: TemplateProps) {
  return (
    <div className={cn('bg-white text-black min-h-[1056px] w-[816px]', className)}>
      {/* Header with gradient */}
      <header className="bg-gradient-to-r from-purple-600 to-pink-500 text-white p-8">
        <h1 className="text-4xl font-bold">{data.contact.name || 'Your Name'}</h1>
        <div className="flex flex-wrap gap-4 mt-3 text-sm opacity-90">
          {data.contact.email && (
            <span className="flex items-center gap-1">
              <Mail className="h-3 w-3" /> {data.contact.email}
            </span>
          )}
          {data.contact.phone && (
            <span className="flex items-center gap-1">
              <Phone className="h-3 w-3" /> {data.contact.phone}
            </span>
          )}
          {data.contact.location && (
            <span className="flex items-center gap-1">
              <MapPin className="h-3 w-3" /> {data.contact.location}
            </span>
          )}
        </div>
      </header>

      <div className="p-8">
        {/* Summary */}
        {data.summary && (
          <section className="mb-6 p-4 bg-purple-50 rounded-lg border-l-4 border-purple-500">
            <p className="text-sm leading-relaxed">{data.summary}</p>
          </section>
        )}

        <div className="grid grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="col-span-2">
            {/* Experience */}
            {data.experience.length > 0 && (
              <section className="mb-6">
                <h2 className="text-lg font-bold text-purple-600 mb-4 flex items-center gap-2">
                  <span className="w-8 h-0.5 bg-purple-600" />
                  Experience
                </h2>
                {data.experience.map((exp) => (
                  <div key={exp.id} className="mb-5 pl-4 border-l-2 border-purple-200">
                    <h3 className="font-semibold">{exp.position}</h3>
                    <p className="text-sm text-purple-600">{exp.company}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {formatDate(exp.startDate)} - {exp.current ? 'Present' : formatDate(exp.endDate)}
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
                <h2 className="text-lg font-bold text-purple-600 mb-4 flex items-center gap-2">
                  <span className="w-8 h-0.5 bg-purple-600" />
                  Education
                </h2>
                {data.education.map((edu) => (
                  <div key={edu.id} className="mb-3 pl-4 border-l-2 border-purple-200">
                    <h3 className="font-semibold">{edu.degree}</h3>
                    <p className="text-sm text-purple-600">{edu.institution}</p>
                    {edu.field && <p className="text-xs text-gray-500">{edu.field}</p>}
                  </div>
                ))}
              </section>
            )}
          </div>

          {/* Sidebar */}
          <div>
            {/* Skills */}
            {data.skills.length > 0 && (
              <section className="bg-gray-50 rounded-lg p-4">
                <h2 className="text-lg font-bold text-purple-600 mb-3">Skills</h2>
                <div className="flex flex-wrap gap-2">
                  {data.skills.map((skill, i) => (
                    <span 
                      key={i} 
                      className="px-2 py-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs rounded-full"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </section>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
