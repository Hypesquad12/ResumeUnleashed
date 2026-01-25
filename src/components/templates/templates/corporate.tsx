'use client'

import { cn } from '@/lib/utils'
import type { TemplateProps } from '../types'
import { formatDate } from '../base-template'
import { Mail, Phone, MapPin, Linkedin, Globe } from 'lucide-react'

export function CorporateTemplate({ data, className }: TemplateProps) {
  return (
    <div className={cn('bg-white text-gray-800 min-h-[1056px] w-[816px]', className)}>
      {/* Header */}
      <header className="bg-sky-700 text-white p-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold">{data.contact.name || 'Your Name'}</h1>
            {data.summary && (
              <p className="mt-2 text-sky-100 text-sm max-w-lg">{data.summary}</p>
            )}
          </div>
          <div className="text-right text-sm space-y-1">
            {data.contact.email && (
              <div className="flex items-center justify-end gap-2">
                <span>{data.contact.email}</span>
                <Mail className="h-3 w-3" />
              </div>
            )}
            {data.contact.phone && (
              <div className="flex items-center justify-end gap-2">
                <span>{data.contact.phone}</span>
                <Phone className="h-3 w-3" />
              </div>
            )}
            {data.contact.location && (
              <div className="flex items-center justify-end gap-2">
                <span>{data.contact.location}</span>
                <MapPin className="h-3 w-3" />
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="p-6">
        {/* Experience */}
        {data.experience.length > 0 && (
          <section className="mb-6">
            <h2 className="text-lg font-bold text-sky-700 border-b-2 border-sky-700 pb-1 mb-4">
              PROFESSIONAL EXPERIENCE
            </h2>
            {data.experience.map((exp) => (
              <div key={exp.id} className="mb-5">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold">{exp.position}</h3>
                    <p className="text-sky-700">{exp.company}{exp.location && ` • ${exp.location}`}</p>
                  </div>
                  <span className="text-sm text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                    {formatDate(exp.startDate)} - {exp.current ? 'Present' : formatDate(exp.endDate)}
                  </span>
                </div>
                {exp.description && typeof exp.description === 'string' && (
                  <ul className="mt-2 text-sm text-gray-600 space-y-1">
                    {exp.description.split('\n').filter(b => b.trim()).map((bullet, i) => (
                      <li key={i} className="flex gap-2">
                        <span className="text-sky-700">▸</span>
                        {bullet.replace(/^[-•]\s*/, '')}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </section>
        )}

        <div className="grid grid-cols-2 gap-6">
          {/* Education */}
          {data.education.length > 0 && (
            <section>
              <h2 className="text-lg font-bold text-sky-700 border-b-2 border-sky-700 pb-1 mb-4">
                EDUCATION
              </h2>
              {data.education.map((edu) => (
                <div key={edu.id} className="mb-3">
                  <h3 className="font-bold">{edu.degree}</h3>
                  <p className="text-sky-700 text-sm">{edu.institution}</p>
                  {edu.field && <p className="text-sm text-gray-500">{edu.field}</p>}
                  {edu.gpa && <p className="text-xs text-gray-400">GPA: {edu.gpa}</p>}
                </div>
              ))}
            </section>
          )}

          {/* Skills */}
          {data.skills.length > 0 && (
            <section>
              <h2 className="text-lg font-bold text-sky-700 border-b-2 border-sky-700 pb-1 mb-4">
                KEY SKILLS
              </h2>
              <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                {data.skills.map((skill, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm">
                    <span className="text-sky-700">▸</span>
                    {skill}
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
