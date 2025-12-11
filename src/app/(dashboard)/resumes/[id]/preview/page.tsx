'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { 
  ArrowLeft, Download, Share2, Loader2, Mail, Phone, MapPin, 
  Linkedin, Globe, Calendar
} from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'

interface Resume {
  id: string
  title: string
  contact: {
    name: string
    email: string
    phone: string
    linkedin: string
    location: string
    website?: string
  }
  summary: string
  experience: Array<{
    id: string
    company: string
    position: string
    location: string
    startDate: string
    endDate: string
    current: boolean
    description: string
  }>
  education: Array<{
    id: string
    institution: string
    degree: string
    field: string
    startDate: string
    endDate: string
    gpa: string
  }>
  skills: string[]
}

function formatDate(dateStr: string): string {
  if (!dateStr) return ''
  const date = new Date(dateStr + '-01')
  return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
}

export default function ResumePreviewPage() {
  const router = useRouter()
  const params = useParams()
  const resumeId = params.id as string
  const resumeRef = useRef<HTMLDivElement>(null)
  
  const [loading, setLoading] = useState(true)
  const [resume, setResume] = useState<Resume | null>(null)

  useEffect(() => {
    loadResume()
  }, [resumeId])

  const loadResume = async () => {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('resumes')
      .select('*')
      .eq('id', resumeId)
      .single()

    if (error || !data) {
      toast.error('Resume not found')
      router.push('/resumes')
      return
    }

    setResume({
      id: data.id,
      title: data.title || 'Untitled Resume',
      contact: data.contact || { name: '', email: '', phone: '', linkedin: '', location: '' },
      summary: data.summary || '',
      experience: data.experience || [],
      education: data.education || [],
      skills: data.skills || [],
    })
    setLoading(false)
  }

  const handleDownload = async () => {
    toast.info('PDF download coming soon!')
    // TODO: Implement PDF generation
  }

  const handleShare = async () => {
    toast.info('Share feature coming soon!')
    // TODO: Implement share functionality
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!resume) return null

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href={`/resumes/${resumeId}`}>
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">{resume.title}</h1>
            <p className="text-sm text-muted-foreground">Preview your resume</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleShare}>
            <Share2 className="mr-2 h-4 w-4" />
            Share
          </Button>
          <Button onClick={handleDownload}>
            <Download className="mr-2 h-4 w-4" />
            Download PDF
          </Button>
        </div>
      </div>

      {/* Resume Preview */}
      <div className="flex justify-center">
        <div 
          ref={resumeRef}
          className="w-full max-w-[850px] bg-white shadow-2xl rounded-lg overflow-hidden"
          style={{ minHeight: '1100px' }}
        >
          {/* Resume Content */}
          <div className="p-12 space-y-8">
            {/* Header / Contact */}
            <header className="text-center border-b pb-6">
              <h1 className="text-3xl font-bold text-slate-900 mb-2">
                {resume.contact.name || 'Your Name'}
              </h1>
              <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-slate-600">
                {resume.contact.email && (
                  <span className="flex items-center gap-1">
                    <Mail className="h-3.5 w-3.5" />
                    {resume.contact.email}
                  </span>
                )}
                {resume.contact.phone && (
                  <span className="flex items-center gap-1">
                    <Phone className="h-3.5 w-3.5" />
                    {resume.contact.phone}
                  </span>
                )}
                {resume.contact.location && (
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5" />
                    {resume.contact.location}
                  </span>
                )}
                {resume.contact.linkedin && (
                  <a 
                    href={resume.contact.linkedin} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-blue-600 hover:underline"
                  >
                    <Linkedin className="h-3.5 w-3.5" />
                    LinkedIn
                  </a>
                )}
                {resume.contact.website && (
                  <a 
                    href={resume.contact.website} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-blue-600 hover:underline"
                  >
                    <Globe className="h-3.5 w-3.5" />
                    Portfolio
                  </a>
                )}
              </div>
            </header>

            {/* Summary */}
            {resume.summary && (
              <section>
                <h2 className="text-lg font-semibold text-slate-900 border-b border-slate-200 pb-1 mb-3">
                  Professional Summary
                </h2>
                <p className="text-slate-700 leading-relaxed">{resume.summary}</p>
              </section>
            )}

            {/* Experience */}
            {resume.experience.length > 0 && (
              <section>
                <h2 className="text-lg font-semibold text-slate-900 border-b border-slate-200 pb-1 mb-4">
                  Work Experience
                </h2>
                <div className="space-y-5">
                  {resume.experience.map((exp) => (
                    <div key={exp.id}>
                      <div className="flex justify-between items-start mb-1">
                        <div>
                          <h3 className="font-semibold text-slate-900">{exp.position}</h3>
                          <p className="text-slate-600">{exp.company}{exp.location && ` • ${exp.location}`}</p>
                        </div>
                        <div className="text-sm text-slate-500 flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5" />
                          {formatDate(exp.startDate)} - {exp.current ? 'Present' : formatDate(exp.endDate)}
                        </div>
                      </div>
                      {exp.description && (
                        <div className="text-slate-700 text-sm mt-2 whitespace-pre-line">
                          {exp.description}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Education */}
            {resume.education.length > 0 && (
              <section>
                <h2 className="text-lg font-semibold text-slate-900 border-b border-slate-200 pb-1 mb-4">
                  Education
                </h2>
                <div className="space-y-4">
                  {resume.education.map((edu) => (
                    <div key={edu.id} className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold text-slate-900">
                          {edu.degree}{edu.field && ` in ${edu.field}`}
                        </h3>
                        <p className="text-slate-600">{edu.institution}</p>
                        {edu.gpa && (
                          <p className="text-sm text-slate-500">GPA: {edu.gpa}</p>
                        )}
                      </div>
                      <div className="text-sm text-slate-500 flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5" />
                        {formatDate(edu.startDate)} - {formatDate(edu.endDate)}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Skills */}
            {resume.skills.length > 0 && (
              <section>
                <h2 className="text-lg font-semibold text-slate-900 border-b border-slate-200 pb-1 mb-3">
                  Skills
                </h2>
                <div className="flex flex-wrap gap-2">
                  {resume.skills.map((skill) => (
                    <span 
                      key={skill}
                      className="px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-sm"
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
