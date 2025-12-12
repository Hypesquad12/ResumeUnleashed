'use client'

import { ResumeTemplate } from '@/components/templates'
import type { ResumeData } from '@/components/templates/types'

interface PublicResumeClientProps {
  resume: ResumeData
}

export function PublicResumeClient({ resume }: PublicResumeClientProps) {
  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-[900px] mx-auto">
        <div className="bg-white shadow-xl rounded-lg overflow-hidden">
          <ResumeTemplate templateId={(resume.template as string) || 'classic'} data={resume} />
        </div>
      </div>
    </div>
  )
}
