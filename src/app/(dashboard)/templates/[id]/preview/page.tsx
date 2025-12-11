'use client'

import { useParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Crown, Download, FileText } from 'lucide-react'
import Link from 'next/link'
import { ResumeTemplate, TEMPLATES, getTemplateById } from '@/components/templates'
import type { ResumeData } from '@/components/templates/types'

// Sample data for preview
const sampleData: ResumeData = {
  id: 'preview',
  title: 'Sample Resume',
  contact: {
    name: 'Alex Johnson',
    email: 'alex.johnson@email.com',
    phone: '+1 (555) 123-4567',
    linkedin: 'https://linkedin.com/in/alexjohnson',
    location: 'San Francisco, CA',
    website: 'https://alexjohnson.dev',
  },
  summary: 'Experienced software engineer with 8+ years of expertise in full-stack development, cloud architecture, and team leadership. Passionate about building scalable applications and mentoring junior developers. Proven track record of delivering high-impact projects that drive business growth.',
  experience: [
    {
      id: '1',
      company: 'Tech Corp Inc.',
      position: 'Senior Software Engineer',
      location: 'San Francisco, CA',
      startDate: '2021-03',
      endDate: '',
      current: true,
      description: 'Led development of microservices architecture serving 10M+ users. Mentored team of 5 junior developers. Reduced API response time by 40% through optimization.',
    },
    {
      id: '2',
      company: 'StartupXYZ',
      position: 'Full Stack Developer',
      location: 'Remote',
      startDate: '2018-06',
      endDate: '2021-02',
      current: false,
      description: 'Built and maintained React/Node.js applications. Implemented CI/CD pipelines reducing deployment time by 60%. Collaborated with product team on feature development.',
    },
    {
      id: '3',
      company: 'Digital Agency',
      position: 'Junior Developer',
      location: 'New York, NY',
      startDate: '2016-01',
      endDate: '2018-05',
      current: false,
      description: 'Developed responsive web applications for clients. Participated in code reviews and agile ceremonies.',
    },
  ],
  education: [
    {
      id: '1',
      institution: 'Stanford University',
      degree: 'Master of Science',
      field: 'Computer Science',
      startDate: '2014-09',
      endDate: '2016-06',
      gpa: '3.9/4.0',
    },
    {
      id: '2',
      institution: 'UC Berkeley',
      degree: 'Bachelor of Science',
      field: 'Computer Science',
      startDate: '2010-09',
      endDate: '2014-05',
      gpa: '3.7/4.0',
    },
  ],
  skills: [
    'JavaScript',
    'TypeScript',
    'React',
    'Node.js',
    'Python',
    'AWS',
    'Docker',
    'PostgreSQL',
    'GraphQL',
    'Agile',
  ],
}

export default function TemplatePreviewPage() {
  const params = useParams()
  const router = useRouter()
  const templateId = params.id as string
  const template = getTemplateById(templateId)

  if (!template) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <p className="text-muted-foreground mb-4">Template not found</p>
        <Link href="/templates">
          <Button>Back to Templates</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold">{template.name} Template</h1>
              {template.isPremium ? (
                <Badge className="bg-amber-500">
                  <Crown className="h-3 w-3 mr-1" />
                  Premium
                </Badge>
              ) : (
                <Badge variant="outline" className="text-green-600 border-green-600">
                  Free
                </Badge>
              )}
            </div>
            <p className="text-muted-foreground">{template.description}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Link href={`/resumes/new?template=${templateId}`}>
            <Button>
              <FileText className="h-4 w-4 mr-2" />
              Use This Template
            </Button>
          </Link>
        </div>
      </div>

      {/* Preview */}
      <div className="flex justify-center bg-muted/50 rounded-lg p-8 overflow-auto">
        <div className="shadow-2xl">
          <ResumeTemplate templateId={templateId} data={sampleData} />
        </div>
      </div>

      {/* Other templates */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Other Templates</h2>
        <div className="flex gap-4 overflow-x-auto pb-4">
          {TEMPLATES.filter(t => t.id !== templateId).slice(0, 6).map((t) => (
            <Link key={t.id} href={`/templates/${t.id}/preview`}>
              <div className={`w-32 h-44 bg-gradient-to-br ${t.color} rounded-lg p-2 hover:scale-105 transition-transform cursor-pointer`}>
                <div className="bg-white rounded h-full w-full p-2">
                  <div className="h-2 w-12 bg-slate-800 rounded mx-auto mb-1" />
                  <div className="h-1 w-8 bg-slate-300 rounded mx-auto mb-2" />
                  <div className="space-y-1">
                    <div className="h-1 w-full bg-slate-200 rounded" />
                    <div className="h-1 w-3/4 bg-slate-200 rounded" />
                  </div>
                </div>
              </div>
              <p className="text-xs text-center mt-1 font-medium">{t.name}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
