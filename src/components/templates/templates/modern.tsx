'use client'

import { cn } from '@/lib/utils'
import type { TemplateProps } from '../types'
import { ContactSection, ExperienceItem, EducationItem, SkillsSection, SectionHeader, formatDate } from '../base-template'
import { Mail, Phone, MapPin, Linkedin, Globe } from 'lucide-react'

export function ModernTemplate({ data, className }: TemplateProps) {
  return (
    <div className={cn('bg-white text-black min-h-[1056px] w-[816px] flex', className)}>
      {/* Sidebar */}
      <aside className="w-1/3 bg-teal-600 text-white p-6">
        <div className="mb-8">
          <div className="w-24 h-24 bg-white/20 rounded-full mx-auto mb-4 flex items-center justify-center text-3xl font-bold">
            {data.contact.name?.split(' ').map(n => n[0]).join('') || 'YN'}
          </div>
          <h1 className="text-xl font-bold text-center">{data.contact.name || 'Your Name'}</h1>
        </div>

        {/* Contact */}
        <div className="mb-6">
          <h3 className="text-sm font-bold uppercase tracking-wider mb-3 border-b border-white/30 pb-1">Contact</h3>
          <div className="space-y-2 text-sm">
            {data.contact.email && (
              <div className="flex items-center gap-2">
                <Mail className="h-3 w-3" />
                <span className="break-all">{data.contact.email}</span>
              </div>
            )}
            {data.contact.phone && (
              <div className="flex items-center gap-2">
                <Phone className="h-3 w-3" />
                <span>{data.contact.phone}</span>
              </div>
            )}
            {data.contact.location && (
              <div className="flex items-center gap-2">
                <MapPin className="h-3 w-3" />
                <span>{data.contact.location}</span>
              </div>
            )}
            {data.contact.linkedin && (
              <div className="flex items-center gap-2">
                <Linkedin className="h-3 w-3" />
                <span className="break-all">{data.contact.linkedin.replace('https://linkedin.com/in/', '')}</span>
              </div>
            )}
          </div>
        </div>

        {/* Skills */}
        {data.skills.length > 0 && (
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider mb-3 border-b border-white/30 pb-1">Skills</h3>
            <div className="space-y-1">
              {data.skills.map((skill, i) => (
                <div key={i} className="text-sm flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-white rounded-full" />
                  {skill}
                </div>
              ))}
            </div>
          </div>
        )}
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6">
        {/* Summary */}
        {data.summary && (
          <section className="mb-6">
            <SectionHeader title="About Me" variant="underline" className="border-teal-600" />
            <p className="text-sm leading-relaxed">{data.summary}</p>
          </section>
        )}

        {/* Experience */}
        {data.experience.length > 0 && (
          <section className="mb-6">
            <SectionHeader title="Experience" variant="underline" className="border-teal-600" />
            {data.experience.map((exp) => (
              <ExperienceItem key={exp.id} exp={exp} />
            ))}
          </section>
        )}

        {/* Education */}
        {data.education.length > 0 && (
          <section>
            <SectionHeader title="Education" variant="underline" className="border-teal-600" />
            {data.education.map((edu) => (
              <EducationItem key={edu.id} edu={edu} />
            ))}
          </section>
        )}
      </main>
    </div>
  )
}
