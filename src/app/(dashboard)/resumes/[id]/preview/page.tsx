'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter, useParams, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { 
  ArrowLeft, Download, Share2, Loader2, Palette, ChevronLeft, ChevronRight
} from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'
import { ResumeTemplate, TEMPLATES, getTemplateById } from '@/components/templates'
import type { ResumeData, ContactInfo, Experience, Education } from '@/components/templates/types'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export default function ResumePreviewPage() {
  const router = useRouter()
  const params = useParams()
  const searchParams = useSearchParams()
  const resumeId = params.id as string
  const resumeRef = useRef<HTMLDivElement>(null)
  const shouldDownload = searchParams.get('download') === 'true'
  
  const [loading, setLoading] = useState(true)
  const [resume, setResume] = useState<ResumeData | null>(null)
  const [selectedTemplate, setSelectedTemplate] = useState('classic')

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

    // Parse JSON fields with proper defaults
    const contactData = data.contact as Record<string, unknown> | null
    const contact: ContactInfo = {
      name: (contactData?.name as string) || '',
      email: (contactData?.email as string) || '',
      phone: (contactData?.phone as string) || '',
      linkedin: (contactData?.linkedin as string) || '',
      location: (contactData?.location as string) || '',
      website: (contactData?.website as string) || '',
    }

    const experience = Array.isArray(data.experience) 
      ? (data.experience as unknown as Experience[]) 
      : []
    
    const education = Array.isArray(data.education) 
      ? (data.education as unknown as Education[]) 
      : []
    
    const skills = Array.isArray(data.skills) 
      ? (data.skills as string[]) 
      : []

    const template = (data.template as string) || 'classic'
    setSelectedTemplate(template)

    setResume({
      id: data.id,
      title: data.title || 'Untitled Resume',
      contact,
      summary: data.summary || '',
      experience,
      education,
      skills,
      template,
    })
    setLoading(false)
  }

  const cycleTemplate = (direction: 'prev' | 'next') => {
    const currentIndex = TEMPLATES.findIndex(t => t.id === selectedTemplate)
    let newIndex = direction === 'next' 
      ? (currentIndex + 1) % TEMPLATES.length
      : (currentIndex - 1 + TEMPLATES.length) % TEMPLATES.length
    setSelectedTemplate(TEMPLATES[newIndex].id)
  }

  const handleDownload = () => {
    // Use browser print to PDF functionality
    const printContent = resumeRef.current
    if (!printContent) return

    const printWindow = window.open('', '_blank')
    if (!printWindow) {
      toast.error('Please allow popups to download PDF')
      return
    }

    const styles = Array.from(document.styleSheets)
      .map(styleSheet => {
        try {
          return Array.from(styleSheet.cssRules)
            .map(rule => rule.cssText)
            .join('')
        } catch {
          return ''
        }
      })
      .join('')

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${resume?.title || 'Resume'}</title>
          <style>
            ${styles}
            @media print {
              body { margin: 0; padding: 0; }
              @page { size: A4; margin: 0; }
            }
            body {
              font-family: system-ui, -apple-system, sans-serif;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
          </style>
        </head>
        <body>
          ${printContent.innerHTML}
        </body>
      </html>
    `)
    printWindow.document.close()
    
    // Wait for styles to load then print
    setTimeout(() => {
      printWindow.print()
      printWindow.close()
    }, 500)
  }

  const handleShare = async () => {
    const shareUrl = window.location.href.replace('?download=true', '')
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: resume?.title || 'My Resume',
          url: shareUrl,
        })
      } catch {
        // User cancelled or share failed
      }
    } else {
      await navigator.clipboard.writeText(shareUrl)
      toast.success('Link copied to clipboard!')
    }
  }

  // Auto-trigger download if URL has download=true
  useEffect(() => {
    if (shouldDownload && !loading && resume) {
      setTimeout(() => handleDownload(), 1000)
    }
  }, [shouldDownload, loading, resume])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!resume) return null

  const currentTemplate = getTemplateById(selectedTemplate)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
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

      {/* Template Selector */}
      <div className="flex items-center justify-center gap-4 bg-muted/50 rounded-lg p-4">
        <Button variant="outline" size="icon" onClick={() => cycleTemplate('prev')}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        
        <div className="flex items-center gap-3">
          <Palette className="h-4 w-4 text-muted-foreground" />
          <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
            <SelectTrigger className="w-[200px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {TEMPLATES.map((template) => (
                <SelectItem key={template.id} value={template.id}>
                  {template.name} {template.isPremium && '⭐'}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Button variant="outline" size="icon" onClick={() => cycleTemplate('next')}>
          <ChevronRight className="h-4 w-4" />
        </Button>

        <span className="text-sm text-muted-foreground ml-2">
          {currentTemplate?.description}
        </span>
      </div>

      {/* Resume Preview */}
      <div className="flex justify-center bg-muted/30 rounded-lg p-8 overflow-auto">
        <div ref={resumeRef} className="shadow-2xl">
          <ResumeTemplate templateId={selectedTemplate} data={resume} />
        </div>
      </div>
    </div>
  )
}
