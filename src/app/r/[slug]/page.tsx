import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { PublicResumeClient } from './public-resume-client'
import type { ResumeData } from '@/components/templates/types'

interface PageProps {
  params: Promise<{ slug: string }>
}

export default async function PublicResumePage({ params }: PageProps) {
  const { slug } = await params
  const supabase = await createClient()

  const { data, error } = await (supabase as any).rpc('get_public_resume_by_slug', { slug })

  if (error || !data) {
    notFound()
  }

  const resume = (data as any)?.resume as Partial<ResumeData> | undefined
  if (!resume) {
    notFound()
  }

  const normalizedResume: ResumeData = {
    id: (resume.id as string) || slug,
    title: (resume.title as string) || 'Resume',
    contact: (resume.contact || {}) as ResumeData['contact'],
    summary: resume.summary || '',
    experience: Array.isArray(resume.experience) ? (resume.experience as any) : [],
    education: Array.isArray(resume.education) ? (resume.education as any) : [],
    skills: Array.isArray(resume.skills) ? (resume.skills as any) : [],
    template: (resume.template as string) || 'classic',
  }

  return <PublicResumeClient resume={normalizedResume} />
}
