'use client'

import { cn } from '@/lib/utils'
import type { TemplateProps } from '../types'
import { formatDate } from '../base-template'
import { Mail, Phone, MapPin, Linkedin } from 'lucide-react'

export function DistinguishedTemplate({ data, className }: TemplateProps) {
  return (
    <div className={cn('bg-white text-gray-800 min-h-[1056px] w-[816px] flex', className)}>
      {/* Sidebar */}
      <aside className="w-1/3 bg-gradient-to-b from-emerald-700 to-teal-800 text-white p-6">
        {/* Photo placeholder */}
        <div className="w-28 h-28 bg-white/10 rounded-full mx-auto mb-6 flex items-center justify-center border-2 border-white/30">
          <span className="text-3xl font-serif">
            {data.contact.name?.split(' ').map(n => n[0]).join('') || 'YN'}
          </span>
        </div>

        {/* Contact */}
        <div className="mb-8">
          <h3 className="text-xs uppercase tracking-widest text-emerald-200 mb-3">Contact</h3>
          <div className="space-y-3 text-sm">
            {data.contact.email && (
              <div className="flex items-start gap-2">
                <Mail className="h-4 w-4 mt-0.5 text-emerald-300" />
                <span className="break-all">{data.contact.email}</span>
              </div>
            )}
            {data.contact.phone && (
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-emerald-300" />
                <span>{data.contact.phone}</span>
              </div>
            )}
            {data.contact.location && (
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-emerald-300" />
                <span>{data.contact.location}</span>
              </div>
            )}
            {data.contact.linkedin && (
              <div className="flex items-start gap-2">
                <Linkedin className="h-4 w-4 mt-0.5 text-emerald-300" />
                <span className="break-all text-xs">{data.contact.linkedin.replace('https://linkedin.com/in/', '')}</span>
              </div>
            )}
          </div>
        </div>

        {/* Skills */}
        {data.skills.length > 0 && (
          <div className="mb-8">
            <h3 className="text-xs uppercase tracking-widest text-emerald-200 mb-3">Expertise</h3>
            <div className="space-y-2">
              {data.skills.map((skill, i) => (
                <div key={i} className="text-sm">
                  <div className="flex justify-between mb-1">
                    <span>{skill}</span>
                  </div>
                  <div className="h-1 bg-emerald-900 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-emerald-300 rounded-full"
                      style={{ width: `${95 - (i * 5)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Education */}
        {data.education.length > 0 && (
          <div>
            <h3 className="text-xs uppercase tracking-widest text-emerald-200 mb-3">Education</h3>
            {data.education.map((edu) => (
              <div key={edu.id} className="mb-4">
                <h4 className="font-semibold text-sm">{edu.degree}</h4>
                <p className="text-emerald-200 text-xs">{edu.institution}</p>
                {edu.field && <p className="text-emerald-300 text-xs">{edu.field}</p>}
              </div>
            ))}
          </div>
        )}
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8">
        {/* Header */}
        <header className="mb-8 pb-6 border-b-2 border-emerald-600">
          <h1 className="text-4xl font-serif text-emerald-800">{data.contact.name || 'Your Name'}</h1>
          {data.summary && (
            <p className="mt-4 text-gray-600 leading-relaxed">{data.summary}</p>
          )}
        </header>

        {/* Experience */}
        {data.experience.length > 0 && (
          <section>
            <h2 className="text-lg font-serif text-emerald-700 mb-6 flex items-center gap-3">
              <span className="w-8 h-0.5 bg-emerald-600" />
              Professional Experience
            </h2>
            {data.experience.map((exp) => (
              <div key={exp.id} className="mb-6 relative pl-6">
                <div className="absolute left-0 top-2 w-2 h-2 bg-emerald-600 rounded-full" />
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-lg">{exp.position}</h3>
                    <p className="text-emerald-700">{exp.company}</p>
                  </div>
                  <span className="text-sm text-gray-500">
                    {formatDate(exp.startDate)} — {exp.current ? 'Present' : formatDate(exp.endDate)}
                  </span>
                </div>
                {exp.description && (
                  <p className="mt-2 text-sm text-gray-600">{exp.description}</p>
                )}
              </div>
            ))}
          </section>
        )}
      </main>
    </div>
  )
}
