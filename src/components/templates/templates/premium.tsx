
import { cn } from '@/lib/utils'
import type { TemplateProps } from '../types'
import { formatDate } from '../base-template'
import { Mail, Phone, MapPin, Linkedin, Globe } from 'lucide-react'

export function PremiumTemplate({ data, className }: TemplateProps) {
  return (
    <div className={cn('bg-gradient-to-br from-amber-50 to-orange-50 text-gray-800 min-h-[1056px] w-[816px]', className)}>
      {/* Luxury Header */}
      <header className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-amber-600 to-orange-500" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRjMC0yIDItNCAyLTRzLTItMi00LTJjMCAwIDItMiAyLTRzLTItNC0yLTRjMiAwIDQtMiA0LTJzMiAyIDQgMmMwIDAtMiAyLTIgNHMyIDQgMiA0Yy0yIDAtNCAyLTQgMnMtMi0yLTQtMmMwIDAgMi0yIDItNHoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-30" />
        <div className="relative z-10 p-8 text-white">
          <h1 className="text-4xl font-bold tracking-wide">{data.contact.name || 'Your Name'}</h1>
          <div className="flex flex-wrap gap-6 mt-4 text-sm text-amber-100">
            {data.contact.email && (
              <span className="flex items-center gap-2">
                <Mail className="h-4 w-4" /> {data.contact.email}
              </span>
            )}
            {data.contact.phone && (
              <span className="flex items-center gap-2">
                <Phone className="h-4 w-4" /> {data.contact.phone}
              </span>
            )}
            {data.contact.location && (
              <span className="flex items-center gap-2">
                <MapPin className="h-4 w-4" /> {data.contact.location}
              </span>
            )}
          </div>
        </div>
      </header>

      {/* Gold accent */}
      <div className="h-1 bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-400" />

      <div className="p-8">
        {/* Summary */}
        {data.summary && (
          <section className="mb-8">
            <h2 className="text-lg font-bold text-amber-700 mb-3 flex items-center gap-2">
              <span className="w-6 h-0.5 bg-amber-500" />
              Executive Profile
            </h2>
            <p className="text-gray-700 leading-relaxed pl-8">{data.summary}</p>
          </section>
        )}

        {/* Experience */}
        {data.experience.length > 0 && (
          <section className="mb-8">
            <h2 className="text-lg font-bold text-amber-700 mb-4 flex items-center gap-2">
              <span className="w-6 h-0.5 bg-amber-500" />
              Professional Experience
            </h2>
            {data.experience.map((exp) => (
              <div key={exp.id} className="mb-6 pl-8">
                <div className="flex justify-between items-start border-b border-amber-200 pb-2">
                  <div>
                    <h3 className="font-bold text-lg">{exp.position}</h3>
                    <p className="text-amber-700">{exp.company}</p>
                  </div>
                  <span className="text-sm text-gray-500 bg-amber-100 px-3 py-1 rounded-full">
                    {formatDate(exp.startDate)} - {exp.current ? 'Present' : formatDate(exp.endDate)}
                  </span>
                </div>
                {exp.description && (
                  <p className="mt-3 text-sm text-gray-600">{exp.description}</p>
                )}
              </div>
            ))}
          </section>
        )}

        <div className="grid grid-cols-2 gap-8">
          {/* Education */}
          {data.education.length > 0 && (
            <section>
              <h2 className="text-lg font-bold text-amber-700 mb-4 flex items-center gap-2">
                <span className="w-6 h-0.5 bg-amber-500" />
                Education
              </h2>
              {data.education.map((edu) => (
                <div key={edu.id} className="mb-4 pl-8">
                  <h3 className="font-semibold">{edu.degree}</h3>
                  <p className="text-amber-700 text-sm">{edu.institution}</p>
                  {edu.field && <p className="text-xs text-gray-500">{edu.field}</p>}
                </div>
              ))}
            </section>
          )}

          {/* Skills */}
          {data.skills.length > 0 && (
            <section>
              <h2 className="text-lg font-bold text-amber-700 mb-4 flex items-center gap-2">
                <span className="w-6 h-0.5 bg-amber-500" />
                Core Competencies
              </h2>
              <div className="pl-8 flex flex-wrap gap-2">
                {data.skills.map((skill, i) => (
                  <span 
                    key={i} 
                    className="px-3 py-1 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-sm rounded-full"
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
  )
}
