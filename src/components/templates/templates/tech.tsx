
import { cn } from '@/lib/utils'
import type { TemplateProps } from '../types'
import { formatDate } from '../base-template'
import { Mail, Phone, MapPin, Github, Linkedin, Globe } from 'lucide-react'

export function TechTemplate({ data, className }: TemplateProps) {
  return (
    <div className={cn('bg-gray-900 text-gray-100 min-h-[1056px] w-[816px]', className)}>
      {/* Terminal-style header */}
      <header className="bg-gray-800 p-6 border-b border-green-500/30">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-3 h-3 rounded-full bg-red-500" />
          <div className="w-3 h-3 rounded-full bg-yellow-500" />
          <div className="w-3 h-3 rounded-full bg-green-500" />
          <span className="ml-4 text-gray-500 text-sm font-mono">~/resume/{data.contact.name?.toLowerCase().replace(' ', '-') || 'developer'}</span>
        </div>
        <h1 className="text-3xl font-mono">
          <span className="text-green-400">const</span>{' '}
          <span className="text-yellow-400">developer</span>{' '}
          <span className="text-white">=</span>{' '}
          <span className="text-emerald-400">&quot;{data.contact.name || 'Your Name'}&quot;</span>
        </h1>
        <div className="flex flex-wrap gap-4 mt-4 text-sm font-mono text-gray-400">
          {data.contact.email && <span className="text-cyan-400">{data.contact.email}</span>}
          {data.contact.phone && <span>{data.contact.phone}</span>}
          {data.contact.location && <span>{data.contact.location}</span>}
        </div>
      </header>

      <div className="p-6 grid grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="col-span-2 space-y-6">
          {/* Summary */}
          {data.summary && (
            <section>
              <h2 className="text-green-400 font-mono text-sm mb-2">// About</h2>
              <p className="text-gray-300 text-sm leading-relaxed">{data.summary}</p>
            </section>
          )}

          {/* Experience */}
          {data.experience.length > 0 && (
            <section>
              <h2 className="text-green-400 font-mono text-sm mb-4">// Experience</h2>
              {data.experience.map((exp, i) => (
                <div key={exp.id} className="mb-5 bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-yellow-400">{exp.position}</h3>
                      <p className="text-cyan-400 text-sm">{exp.company}</p>
                    </div>
                    <span className="text-xs text-gray-500 font-mono bg-gray-800 px-2 py-1 rounded">
                      {formatDate(exp.startDate)} → {exp.current ? 'present' : formatDate(exp.endDate)}
                    </span>
                  </div>
                  {exp.description && typeof exp.description === 'string' && (
                    <ul className="mt-3 text-sm text-gray-400 space-y-1 list-none">
                      {exp.description.split('\n').filter(b => b.trim()).map((bullet, i) => (
                        <li key={i} className="flex gap-2">
                          <span className="text-green-400 font-mono">›</span>
                          <span>{bullet.replace(/^[-•]\s*/, '')}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </section>
          )}

          {/* Education */}
          {data.education.length > 0 && (
            <section>
              <h2 className="text-green-400 font-mono text-sm mb-4">// Education</h2>
              {data.education.map((edu) => (
                <div key={edu.id} className="mb-3">
                  <h3 className="font-semibold text-yellow-400">{edu.degree}</h3>
                  <p className="text-cyan-400 text-sm">{edu.institution}</p>
                  {edu.field && <p className="text-gray-500 text-sm">{edu.field}</p>}
                </div>
              ))}
            </section>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Skills */}
          {data.skills.length > 0 && (
            <section className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
              <h2 className="text-green-400 font-mono text-sm mb-3">// Tech Stack</h2>
              <div className="flex flex-wrap gap-2">
                {data.skills.map((skill, i) => (
                  <span 
                    key={i} 
                    className="px-2 py-1 bg-gray-700 text-green-400 text-xs font-mono rounded border border-green-500/30"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </section>
          )}

          {/* Links */}
          <section className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
            <h2 className="text-green-400 font-mono text-sm mb-3">// Links</h2>
            <div className="space-y-2 text-sm">
              {data.contact.linkedin && (
                <div className="flex items-center gap-2 text-gray-400">
                  <Linkedin className="h-4 w-4 text-cyan-400" />
                  <span className="font-mono text-xs break-all">{data.contact.linkedin}</span>
                </div>
              )}
              {data.contact.website && (
                <div className="flex items-center gap-2 text-gray-400">
                  <Globe className="h-4 w-4 text-cyan-400" />
                  <span className="font-mono text-xs break-all">{data.contact.website}</span>
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
