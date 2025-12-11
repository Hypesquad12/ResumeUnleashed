'use client'

import { cn } from '@/lib/utils'
import type { TemplateProps } from '../types'
import { formatDate } from '../base-template'

export function ExecutiveTemplate({ data, className }: TemplateProps) {
  return (
    <div className={cn('bg-white text-black min-h-[1056px] w-[816px]', className)}>
      {/* Header */}
      <header className="bg-amber-800 text-white p-8">
        <h1 className="text-4xl font-serif">{data.contact.name || 'Your Name'}</h1>
        <div className="flex gap-6 mt-3 text-sm text-amber-100">
          {data.contact.email && <span>{data.contact.email}</span>}
          {data.contact.phone && <span>{data.contact.phone}</span>}
          {data.contact.location && <span>{data.contact.location}</span>}
        </div>
      </header>

      {/* Gold accent bar */}
      <div className="h-2 bg-gradient-to-r from-amber-400 to-amber-600" />

      <div className="p-8">
        {/* Summary */}
        {data.summary && (
          <section className="mb-8">
            <h2 className="text-xl font-serif text-amber-800 mb-3">Executive Summary</h2>
            <p className="text-sm leading-relaxed border-l-2 border-amber-400 pl-4">{data.summary}</p>
          </section>
        )}

        {/* Experience */}
        {data.experience.length > 0 && (
          <section className="mb-8">
            <h2 className="text-xl font-serif text-amber-800 mb-4">Professional Experience</h2>
            {data.experience.map((exp) => (
              <div key={exp.id} className="mb-6">
                <div className="flex justify-between items-baseline border-b border-amber-200 pb-2">
                  <div>
                    <h3 className="font-bold text-lg">{exp.position}</h3>
                    <p className="text-amber-700">{exp.company}{exp.location && ` | ${exp.location}`}</p>
                  </div>
                  <span className="text-sm text-gray-600">
                    {formatDate(exp.startDate)} — {exp.current ? 'Present' : formatDate(exp.endDate)}
                  </span>
                </div>
                {exp.description && (
                  <p className="mt-3 text-sm text-gray-700">{exp.description}</p>
                )}
              </div>
            ))}
          </section>
        )}

        <div className="grid grid-cols-2 gap-8">
          {/* Education */}
          {data.education.length > 0 && (
            <section>
              <h2 className="text-xl font-serif text-amber-800 mb-4">Education</h2>
              {data.education.map((edu) => (
                <div key={edu.id} className="mb-4">
                  <h3 className="font-semibold">{edu.degree}</h3>
                  <p className="text-sm text-amber-700">{edu.institution}</p>
                  {edu.field && <p className="text-sm text-gray-600">{edu.field}</p>}
                  {edu.gpa && <p className="text-xs text-gray-500">GPA: {edu.gpa}</p>}
                </div>
              ))}
            </section>
          )}

          {/* Skills */}
          {data.skills.length > 0 && (
            <section>
              <h2 className="text-xl font-serif text-amber-800 mb-4">Core Competencies</h2>
              <div className="grid grid-cols-2 gap-2">
                {data.skills.map((skill, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm">
                    <div className="w-1.5 h-1.5 bg-amber-600 rounded-full" />
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
