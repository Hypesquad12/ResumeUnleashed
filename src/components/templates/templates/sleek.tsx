'use client'

import { cn } from '@/lib/utils'
import type { TemplateProps } from '../types'
import { formatDate } from '../base-template'
import { Mail, Phone, MapPin, Globe, Linkedin } from 'lucide-react'

export function SleekTemplate({ data, className }: TemplateProps) {
  return (
    <div className={cn('bg-slate-900 text-white min-h-[1056px] w-[816px] p-8', className)}>
      {/* Header */}
      <header className="mb-8">
        <h1 className="text-5xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
          {data.contact.name || 'Your Name'}
        </h1>
        <div className="flex flex-wrap gap-4 mt-4 text-sm text-slate-400">
          {data.contact.email && (
            <span className="flex items-center gap-1">
              <Mail className="h-3 w-3 text-indigo-400" /> {data.contact.email}
            </span>
          )}
          {data.contact.phone && (
            <span className="flex items-center gap-1">
              <Phone className="h-3 w-3 text-indigo-400" /> {data.contact.phone}
            </span>
          )}
          {data.contact.location && (
            <span className="flex items-center gap-1">
              <MapPin className="h-3 w-3 text-indigo-400" /> {data.contact.location}
            </span>
          )}
        </div>
      </header>

      {/* Summary */}
      {data.summary && (
        <section className="mb-8">
          <p className="text-slate-300 leading-relaxed">{data.summary}</p>
        </section>
      )}

      <div className="grid grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="col-span-2 space-y-8">
          {/* Experience */}
          {data.experience.length > 0 && (
            <section>
              <h2 className="text-lg font-bold text-indigo-400 uppercase tracking-wider mb-4">Experience</h2>
              {data.experience.map((exp) => (
                <div key={exp.id} className="mb-6 relative pl-4 before:absolute before:left-0 before:top-0 before:bottom-0 before:w-0.5 before:bg-gradient-to-b before:from-indigo-500 before:to-purple-500">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-white">{exp.position}</h3>
                      <p className="text-indigo-400">{exp.company}</p>
                    </div>
                    <span className="text-xs text-slate-500 bg-slate-800 px-2 py-1 rounded">
                      {formatDate(exp.startDate)} - {exp.current ? 'Present' : formatDate(exp.endDate)}
                    </span>
                  </div>
                  {exp.description && (
                    <p className="mt-2 text-sm text-slate-400">{exp.description}</p>
                  )}
                </div>
              ))}
            </section>
          )}

          {/* Education */}
          {data.education.length > 0 && (
            <section>
              <h2 className="text-lg font-bold text-indigo-400 uppercase tracking-wider mb-4">Education</h2>
              {data.education.map((edu) => (
                <div key={edu.id} className="mb-4">
                  <h3 className="font-semibold text-white">{edu.degree}</h3>
                  <p className="text-indigo-400">{edu.institution}</p>
                  {edu.field && <p className="text-sm text-slate-500">{edu.field}</p>}
                </div>
              ))}
            </section>
          )}
        </div>

        {/* Sidebar */}
        <div>
          {/* Skills */}
          {data.skills.length > 0 && (
            <section className="bg-slate-800/50 rounded-lg p-4">
              <h2 className="text-lg font-bold text-indigo-400 uppercase tracking-wider mb-4">Skills</h2>
              <div className="space-y-2">
                {data.skills.map((skill, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <div className="flex-1 h-2 bg-slate-700 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"
                        style={{ width: `${85 - (i * 5)}%` }}
                      />
                    </div>
                    <span className="text-xs text-slate-400 w-20">{skill}</span>
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
