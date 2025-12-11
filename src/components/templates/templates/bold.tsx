'use client'

import { cn } from '@/lib/utils'
import type { TemplateProps } from '../types'
import { formatDate } from '../base-template'
import { Mail, Phone, MapPin } from 'lucide-react'

export function BoldTemplate({ data, className }: TemplateProps) {
  return (
    <div className={cn('bg-white text-black min-h-[1056px] w-[816px]', className)}>
      {/* Bold Header */}
      <header className="bg-red-600 text-white p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-red-500 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="relative z-10">
          <h1 className="text-5xl font-black uppercase tracking-tight">
            {data.contact.name || 'Your Name'}
          </h1>
          <div className="flex flex-wrap gap-6 mt-4 text-sm">
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

      <div className="p-8">
        {/* Summary */}
        {data.summary && (
          <section className="mb-8">
            <h2 className="text-2xl font-black text-red-600 uppercase mb-3">About Me</h2>
            <p className="text-gray-700 leading-relaxed">{data.summary}</p>
          </section>
        )}

        {/* Experience */}
        {data.experience.length > 0 && (
          <section className="mb-8">
            <h2 className="text-2xl font-black text-red-600 uppercase mb-4">Experience</h2>
            {data.experience.map((exp) => (
              <div key={exp.id} className="mb-6 border-l-4 border-red-600 pl-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-xl font-bold">{exp.position}</h3>
                    <p className="text-red-600 font-semibold">{exp.company}</p>
                  </div>
                  <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                    {formatDate(exp.startDate)} - {exp.current ? 'Present' : formatDate(exp.endDate)}
                  </span>
                </div>
                {exp.description && (
                  <p className="mt-2 text-gray-600">{exp.description}</p>
                )}
              </div>
            ))}
          </section>
        )}

        <div className="grid grid-cols-2 gap-8">
          {/* Education */}
          {data.education.length > 0 && (
            <section>
              <h2 className="text-2xl font-black text-red-600 uppercase mb-4">Education</h2>
              {data.education.map((edu) => (
                <div key={edu.id} className="mb-4">
                  <h3 className="font-bold">{edu.degree}</h3>
                  <p className="text-red-600">{edu.institution}</p>
                  {edu.field && <p className="text-sm text-gray-500">{edu.field}</p>}
                </div>
              ))}
            </section>
          )}

          {/* Skills */}
          {data.skills.length > 0 && (
            <section>
              <h2 className="text-2xl font-black text-red-600 uppercase mb-4">Skills</h2>
              <div className="flex flex-wrap gap-2">
                {data.skills.map((skill, i) => (
                  <span 
                    key={i} 
                    className="px-3 py-1 bg-red-600 text-white font-bold text-sm rounded"
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
