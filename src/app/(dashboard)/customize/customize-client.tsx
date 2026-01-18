'use client'

import { useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { 
  Sparkles, FileText, Link as LinkIcon, ArrowRight, Check, 
  Loader2, Wand2, Target, Shield, Download, Eye, QrCode, Copy, ExternalLink, History, Clock,
  Mail, ChevronDown, ChevronUp
} from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'
import { QRCodeSVG } from 'qrcode.react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { createClient } from '@/lib/supabase/client'
import { OptionSelector } from './components/option-selector'
import { AiLoadingOverlay } from '@/components/ai-loading-overlay'
import { canPerformAction } from '@/lib/subscription-limits'
import { UpgradeModal } from '@/components/upgrade-modal'

interface Resume {
  id: string
  title: string
  updated_at: string | null
  created_at: string | null
}

interface CustomizationHistory {
  id: string
  title: string
  source_resume_id: string | null
  match_score: number | null
  created_at: string | null
  cover_letter: string | null
}

interface CustomizeClientProps {
  resumes: Resume[]
  history?: CustomizationHistory[]
}

export function CustomizeClient({ resumes, history = [] }: CustomizeClientProps) {
  const searchParams = useSearchParams()
  const preselectedResumeId = searchParams.get('resume')
  
  // Auto-select if only one resume exists
  const defaultResumeId = preselectedResumeId || (resumes.length === 1 ? resumes[0].id : null)
  const [selectedResume, setSelectedResume] = useState<string | null>(defaultResumeId)
  const [jobDescriptionMethod, setJobDescriptionMethod] = useState<'text' | 'url' | null>(null)
  const [jobDescription, setJobDescription] = useState('')
  const [jobUrl, setJobUrl] = useState('')
  const [isCustomizing, setIsCustomizing] = useState(false)
  const [customizationComplete, setCustomizationComplete] = useState(false)
  const [customizedResumeId, setCustomizedResumeId] = useState<string | null>(null)
  const [showQRCode, setShowQRCode] = useState(false)
  const [publicResumeSlug, setPublicResumeSlug] = useState<string | null>(null)
  const [creatingPublicLink, setCreatingPublicLink] = useState(false)
  const [customizationHistory, setCustomizationHistory] = useState<CustomizationHistory[]>(history)
  const [optimizationStats, setOptimizationStats] = useState({ keywords: 0, sections: 0, score: 0 })
  const [aiSuggestions, setAiSuggestions] = useState<{
    keywords_added: string[]
    changes: string[]
  }>({ keywords_added: [], changes: [] })
  const [coverLetter, setCoverLetter] = useState<string>('')
  const [generatingCoverLetter, setGeneratingCoverLetter] = useState(false)
  
  // Upgrade modal state
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)
  const [upgradeInfo, setUpgradeInfo] = useState({ current: 0, limit: 0, tier: 'free', isTrialActive: false })
  const [showCoverLetter, setShowCoverLetter] = useState(false)
  
  // Multiple options state
  const [aiOptions, setAiOptions] = useState<any[]>([])
  const [selectedOptionIndex, setSelectedOptionIndex] = useState<number | null>(null)
  const [editableJobTitle, setEditableJobTitle] = useState('')
  const [editableJobDescription, setEditableJobDescription] = useState('')
  const [editableResume, setEditableResume] = useState<any>(null)
  const [showOptionsStep, setShowOptionsStep] = useState(false)

  const hasResumes = resumes.length > 0
  const canStartCustomization = selectedResume && (jobDescription.trim() || jobUrl.trim())
  const showAiOverlay = isCustomizing || generatingCoverLetter

  const handleStartCustomization = async () => {
    if (!canStartCustomization) return
    
    setIsCustomizing(true)
    const supabase = createClient()
    
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        toast.error('Please login to customize resumes')
        return
      }

      // Get the source resume data
      const { data: sourceResume } = await supabase
        .from('resumes')
        .select('*')
        .eq('id', selectedResume)
        .single()

      if (!sourceResume) {
        toast.error('Source resume not found')
        setIsCustomizing(false)
        return
      }

      // Call Next.js API route for AI customization
      const jdText = jobDescription || jobUrl
      
      const apiResponse = await fetch('/api/customize-resume', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resume: {
            contact: sourceResume.contact,
            summary: sourceResume.summary,
            experience: sourceResume.experience,
            education: sourceResume.education,
            skills: sourceResume.skills,
          },
          jobDescription: jdText,
        }),
      })

      if (!apiResponse.ok) {
        const errorData = await apiResponse.json()
        throw new Error(errorData.error || 'Failed to customize resume')
      }

      const edgeFnResult = await apiResponse.json()
      
      if (!edgeFnResult?.success) {
        throw new Error(edgeFnResult?.error || 'Failed to customize resume')
      }

      const aiResult = edgeFnResult.data
      
      // Check if we have multiple options
      if (aiResult.options && Array.isArray(aiResult.options) && aiResult.options.length > 1) {
        // Multiple options - show selection UI
        setAiOptions(aiResult.options)
        setShowOptionsStep(true)
        setIsCustomizing(false)
        return
      }
      
      // Single option or old format - proceed directly
      const option = aiResult.options?.[0] || aiResult
      const jobTitle = option.job_title || 'Customized'
      const companyName = option.company_name || 'Not specified'
      
      // Set optimization stats from AI response
      const stats = {
        keywords: option.keywords_added?.length || 0,
        sections: option.changes?.length || 0,
        score: option.match_score || 85
      }
      setOptimizationStats(stats)
      setAiSuggestions({
        keywords_added: option.keywords_added || [],
        changes: option.changes || [],
      })
      
      // Set cover letter if provided
      if (option.cover_letter) {
        setCoverLetter(option.cover_letter)
      }

      // Save to customized_resumes table with AI-customized content
      const { data: customized, error } = await supabase
        .from('customized_resumes')
        .insert({
          user_id: user.id,
          source_resume_id: selectedResume,
          title: `${sourceResume.title} - ${jobTitle} - ${companyName}`,
          customized_content: option.customized_resume || {
            contact: sourceResume.contact,
            summary: sourceResume.summary,
            experience: sourceResume.experience,
            education: sourceResume.education,
            skills: sourceResume.skills,
          },
          ai_suggestions: {
            keywords_added: option.keywords_added || [],
            changes: option.changes || [],
            job_description: jdText,
          },
          cover_letter: option.cover_letter || null,
          match_score: stats.score,
        })
        .select()
        .single()

      if (error) {
        console.error('Error saving customization:', error)
        // Fall back to using source resume ID for preview
        setCustomizedResumeId(selectedResume)
      } else {
        setCustomizedResumeId(customized.id)
        // Update local history
        setCustomizationHistory(prev => [{
          id: customized.id,
          title: customized.title,
          source_resume_id: customized.source_resume_id,
          match_score: customized.match_score,
          created_at: customized.created_at || new Date().toISOString(),
          cover_letter: customized.cover_letter || null,
        }, ...prev])

        // Create or reuse a public link (for QR + public access)
        try {
          setCreatingPublicLink(true)
          const existing = await supabase
            .from('public_resume_links')
            .select('public_slug')
            .eq('user_id', user.id)
            .eq('customized_resume_id', customized.id)
            .eq('is_active', true)
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle()

          if (existing.data?.public_slug) {
            setPublicResumeSlug(existing.data.public_slug)
          } else {
            const slugBase = (jobTitle || 'resume')
              .toLowerCase()
              .replace(/[^a-z0-9]+/g, '-')
              .replace(/(^-|-$)/g, '')
              .slice(0, 40)
            const slug = `${slugBase}-${Math.random().toString(36).substring(2, 7)}`

            const created = await supabase
              .from('public_resume_links')
              .insert({
                user_id: user.id,
                public_slug: slug,
                customized_resume_id: customized.id,
                is_active: true,
              })
              .select('public_slug')
              .single()

            if (created.data?.public_slug) {
              setPublicResumeSlug(created.data.public_slug)
            }
          }
        } catch (e) {
          console.error('Failed to create public resume link:', e)
        } finally {
          setCreatingPublicLink(false)
        }
      }
      
      toast.success('Resume customization complete!')
      setCustomizationComplete(true)
      // Scroll to top after customization
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch (error) {
      console.error('Customization error:', error)
      toast.error('Failed to customize resume')
    } finally {
      setIsCustomizing(false)
    }
  }

  const handleDownload = async (format: 'pdf' | 'docx' | 'txt' = 'pdf') => {
    // Use the source resume for preview since customized_resumes doesn't have a preview page yet
    const resumeId = selectedResume || customizedResumeId
    if (!resumeId) {
      toast.error('No resume selected')
      return
    }
    
    window.open(`/resumes/${resumeId}/preview?download=true&format=${format}`, '_blank')
  }

  const handlePreview = () => {
    // Use the source resume for preview
    const resumeId = selectedResume || customizedResumeId
    if (!resumeId) {
      toast.error('No resume selected')
      return
    }
    // Open in same page, not new tab
    window.location.href = `/resumes/${resumeId}/preview`
  }

  const getShareableLink = () => {
    if (!publicResumeSlug) return ''
    return `${window.location.origin}/r/${publicResumeSlug}`
  }

  const handleCopyLink = async () => {
    const link = getShareableLink()
    if (!link) {
      toast.error('Public link is not ready yet')
      return
    }
    await navigator.clipboard.writeText(link)
    toast.success('Link copied to clipboard!')
  }

  const handleReset = () => {
    setSelectedResume(null)
    setJobDescriptionMethod(null)
    setJobDescription('')
    setJobUrl('')
    setCustomizationComplete(false)
    setCustomizedResumeId(null)
    setShowQRCode(false)
    setPublicResumeSlug(null)
    setCoverLetter('')
    setShowCoverLetter(false)
    setAiOptions([])
    setSelectedOptionIndex(null)
    setShowOptionsStep(false)
  }

  const handleOptionSelect = async (index: number, editedData: {
    jobTitle: string
    jobDescription: string
    resume: any
  }) => {
    setIsCustomizing(true)
    const supabase = createClient()
    
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        toast.error('Please login to customize resumes')
        return
      }

      if (!selectedResume) {
        toast.error('No resume selected')
        setIsCustomizing(false)
        return
      }

      const { data: sourceResume } = await supabase
        .from('resumes')
        .select('*')
        .eq('id', selectedResume)
        .single()

      if (!sourceResume) {
        toast.error('Source resume not found')
        setIsCustomizing(false)
        return
      }

      const selectedOption = aiOptions[index]
      
      // Use edited data
      const jobTitle = editedData.jobTitle
      const customizedResume = editedData.resume
      
      // Set optimization stats
      const stats = {
        keywords: selectedOption.keywords_added?.length || 0,
        sections: selectedOption.changes?.length || 0,
        score: selectedOption.match_score || 85
      }
      setOptimizationStats(stats)
      setAiSuggestions({
        keywords_added: selectedOption.keywords_added || [],
        changes: selectedOption.changes || [],
      })

      // Save to database
      const jdText = jobDescription || jobUrl
      const { data: customized, error } = await supabase
        .from('customized_resumes')
        .insert({
          user_id: user.id,
          source_resume_id: selectedResume!,
          title: `${sourceResume.title} - ${jobTitle}`,
          customized_content: customizedResume,
          ai_suggestions: {
            keywords_added: selectedOption.keywords_added || [],
            changes: selectedOption.changes || [],
            job_description: jdText,
            job_description_summary: editedData.jobDescription,
          },
          match_score: stats.score,
        })
        .select()
        .single()

      if (error) {
        console.error('Error saving customization:', error)
        setCustomizedResumeId(selectedResume!)
      } else {
        setCustomizedResumeId(customized.id)
        setCustomizationHistory(prev => [{
          id: customized.id,
          title: customized.title,
          source_resume_id: customized.source_resume_id,
          match_score: customized.match_score,
          created_at: customized.created_at || new Date().toISOString(),
          cover_letter: customized.cover_letter || null,
        }, ...prev])

        // Create public link
        try {
          setCreatingPublicLink(true)
          const existing = await supabase
            .from('public_resume_links')
            .select('public_slug')
            .eq('user_id', user.id)
            .eq('customized_resume_id', customized.id)
            .eq('is_active', true)
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle()

          if (existing.data?.public_slug) {
            setPublicResumeSlug(existing.data.public_slug)
          } else {
            const slug = `${user.id.slice(0, 8)}-${Date.now()}`
            const { data: newLink } = await supabase
              .from('public_resume_links')
              .insert({
                user_id: user.id,
                customized_resume_id: customized.id,
                public_slug: slug,
                is_active: true,
              })
              .select()
              .single()

            if (newLink) {
              setPublicResumeSlug(newLink.public_slug)
            }
          }
        } catch (e) {
          console.error('Failed to create public resume link:', e)
        } finally {
          setCreatingPublicLink(false)
        }
      }
      
      toast.success('Resume customization complete!')
      setCustomizationComplete(true)
      setShowOptionsStep(false)
    } catch (error) {
      console.error('Customization error:', error)
      toast.error('Failed to save customization')
    } finally {
      setIsCustomizing(false)
    }
  }

  const handleCancelOptions = () => {
    setShowOptionsStep(false)
    setAiOptions([])
    setSelectedOptionIndex(null)
  }

  const handleCustomize = async () => {
    if (!selectedResume || (!jobDescription && !jobUrl)) {
      toast.error('Please select a resume and provide a job description')
      return
    }

    console.log('[DEBUG] Starting customization flow...')

    // Check subscription limits
    const limitCheck = await canPerformAction('customizations')
    console.log('[DEBUG] Limit check result:', limitCheck)
    
    if (!limitCheck.allowed) {
      console.log('[DEBUG] Limit check failed, showing upgrade modal')
      setUpgradeInfo({ 
        current: limitCheck.current, 
        limit: limitCheck.limit, 
        tier: limitCheck.tier,
        isTrialActive: limitCheck.isTrialActive || false
      })
      setShowUpgradeModal(true)
      return
    }

    setIsCustomizing(true)
    const supabase = createClient()
    
    try {
      console.log('[DEBUG] Fetching source resume:', selectedResume)
      const { data: sourceResume, error: resumeError } = await supabase
        .from('resumes')
        .select('*')
        .eq('id', selectedResume)
        .single()

      if (resumeError) {
        console.error('[DEBUG] Resume fetch error:', resumeError)
        throw new Error('Failed to fetch source resume: ' + resumeError.message)
      }

      if (!sourceResume) {
        console.error('[DEBUG] No resume data returned')
        toast.error('Source resume not found')
        setIsCustomizing(false)
        return
      }

      const jdText = jobDescription || jobUrl
      console.log('[DEBUG] Calling /api/customize-resume with:', {
        hasResume: !!sourceResume,
        hasJobDesc: !!jdText
      })
      
      // Call Next.js API route for AI customization
      const apiResponse = await fetch('/api/customize-resume', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resume: {
            contact: sourceResume.contact,
            summary: sourceResume.summary,
            experience: sourceResume.experience,
            education: sourceResume.education,
            skills: sourceResume.skills,
          },
          jobDescription: jdText,
        }),
      })

      console.log('[DEBUG] API response status:', apiResponse.status)
      
      if (!apiResponse.ok) {
        const errorData = await apiResponse.json().catch(() => ({}))
        console.error('[DEBUG] API error response:', errorData)
        
        // Check if trial limit reached - show activation modal
        if (errorData.errorCode === 'LIMIT_REACHED' && errorData.isTrialActive) {
          console.log('[DEBUG] Trial limit reached, showing activation modal')
          setUpgradeInfo({
            current: 2,
            limit: 2,
            tier: errorData.tier || 'premium',
            isTrialActive: true,
          })
          setShowUpgradeModal(true)
          setIsCustomizing(false)
          return
        }
        
        throw new Error(errorData.error || `API returned ${apiResponse.status}: Failed to customize resume`)
      }

      console.log('[DEBUG] Parsing API response...')
      const result = await apiResponse.json()
      console.log('[DEBUG] API result:', { success: result?.success, hasData: !!result?.data })
      
      if (!result?.success) {
        throw new Error(result?.error || 'Failed to customize resume - no success flag')
      }

      const aiResult = result.data
      const option = aiResult.options?.[0] || aiResult
      const customizedResume = option.customized_resume
      
      const stats = {
        keywords: option.keywords_added?.length || 0,
        sections: option.changes?.length || 0,
        score: option.match_score || 85
      }
      setOptimizationStats(stats)
      setAiSuggestions({
        keywords_added: option.keywords_added || [],
        changes: option.changes || [],
      })
      
      // Set cover letter if provided
      if (option.cover_letter) {
        setCoverLetter(option.cover_letter)
      }

      // Save to database
      const { data: customized, error } = await supabase
        .from('customized_resumes')
        .insert({
          user_id: sourceResume.user_id,
          source_resume_id: selectedResume!,
          title: `${sourceResume.title} - ${option.job_title || 'Customized'}`,
          customized_content: customizedResume,
          ai_suggestions: {
            keywords_added: option.keywords_added || [],
            changes: option.changes || [],
            job_description: jdText,
            job_description_summary: option.job_description_summary,
          },
          cover_letter: option.cover_letter || null,
          match_score: stats.score,
        })
        .select()
        .single()

      if (error) {
        console.error('Error saving customization:', error)
        setCustomizedResumeId(selectedResume!)
      } else {
        setCustomizedResumeId(customized.id)
        setCustomizationHistory(prev => [{
          id: customized.id,
          title: customized.title,
          source_resume_id: customized.source_resume_id,
          match_score: customized.match_score,
          created_at: customized.created_at || new Date().toISOString(),
          cover_letter: customized.cover_letter || null,
        }, ...prev])

        // Create public link
        try {
          setCreatingPublicLink(true)
          const existing = await supabase
            .from('public_resume_links')
            .select('public_slug')
            .eq('user_id', sourceResume.user_id)
            .eq('customized_resume_id', customized.id)
            .eq('is_active', true)
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle()

          if (existing.data?.public_slug) {
            setPublicResumeSlug(existing.data.public_slug)
          } else {
            const slug = `${sourceResume.user_id.slice(0, 8)}-${Date.now()}`
            const { data: newLink } = await supabase
              .from('public_resume_links')
              .insert({
                user_id: sourceResume.user_id,
                customized_resume_id: customized.id,
                public_slug: slug,
                is_active: true,
              })
              .select()
              .single()

            if (newLink) {
              setPublicResumeSlug(newLink.public_slug)
            }
          }
        } catch (e) {
          console.error('Failed to create public resume link:', e)
        } finally {
          setCreatingPublicLink(false)
        }
      }
      
      toast.success('Resume customization complete!')
      setCustomizationComplete(true)
      setShowOptionsStep(false)
      // Scroll to top after customization
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch (error) {
      console.error('[DEBUG] Customization error:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to customize resume'
      toast.error(errorMessage)
    } finally {
      console.log('[DEBUG] Customization flow ended')
      setIsCustomizing(false)
    }
  }

  const generateCoverLetter = async () => {
    if (!selectedResume || (!jobDescription && !jobUrl)) return
    
    setGeneratingCoverLetter(true)
    const supabase = createClient()
    
    try {
      const { data: sourceResume } = await supabase
        .from('resumes')
        .select('*')
        .eq('id', selectedResume)
        .single()

      if (!sourceResume) {
        toast.error('Resume not found')
        return
      }

      const jdText = jobDescription || jobUrl
      
      // Call edge function for cover letter generation
      const { data: result, error } = await supabase.functions.invoke('generate-cover-letter', {
        body: {
          resume: {
            contact: sourceResume.contact,
            summary: sourceResume.summary,
            experience: sourceResume.experience,
            education: sourceResume.education,
            skills: sourceResume.skills,
          },
          jobDescription: jdText,
        },
      })

      if (error || !result?.success) {
        // Fallback to local generation if edge function fails
        const contact = (sourceResume.contact as any) || {}
        const name = contact.name || 'Your Name'
        const experience = (sourceResume.experience as any[]) || []
        const skills = (sourceResume.skills as any[]) || []
        
        // Extract company name from JD if possible
        const companyMatch = jdText.match(/(?:at|for|join)\s+([A-Z][a-zA-Z\s&]+?)(?:\s+as|\s+is|\.|,)/i)
        const companyName = companyMatch ? companyMatch[1].trim() : '[Company Name]'
        
        // Extract job title from JD
        const titleMatch = jdText.match(/(?:position|role|job|hiring|looking for)\s*:?\s*([A-Za-z\s]+?)(?:\s+at|\s+to|\.|,|\n)/i)
        const jobTitle = titleMatch ? titleMatch[1].trim() : 'the position'
        
        // Get recent experience
        const recentJob = experience[0] || {}
        const recentTitle = recentJob.title || 'professional'
        const recentCompany = recentJob.company || ''
        
        // Get top skills
        const topSkills = skills.slice(0, 3).map((s: any) => typeof s === 'string' ? s : s.name || s.skill).filter(Boolean)
        
        const generatedLetter = `Dear Hiring Manager,

I am writing to express my strong interest in ${jobTitle} at ${companyName}. With my background as a ${recentTitle}${recentCompany ? ` at ${recentCompany}` : ''}, I am confident in my ability to contribute meaningfully to your team.

${sourceResume.summary || `Throughout my career, I have developed expertise in ${topSkills.join(', ') || 'various technical and professional skills'}. I am passionate about delivering high-quality results and continuously improving my craft.`}

My experience has equipped me with ${topSkills.length > 0 ? `strong skills in ${topSkills.join(', ')}` : 'a diverse skill set'}, which I believe align well with the requirements outlined in your job description. I am particularly drawn to this opportunity because it would allow me to leverage my expertise while continuing to grow professionally.

I would welcome the opportunity to discuss how my background and skills would benefit ${companyName}. Thank you for considering my application.

Sincerely,
${name}`

        setCoverLetter(generatedLetter)
      } else {
        setCoverLetter(result.data.cover_letter)
      }
      
      setShowCoverLetter(true)
      toast.success('Cover letter generated!')
    } catch (error) {
      console.error('Cover letter generation error:', error)
      toast.error('Failed to generate cover letter')
    } finally {
      setGeneratingCoverLetter(false)
    }
  }

  const handleCopyCoverLetter = async () => {
    await navigator.clipboard.writeText(coverLetter)
    toast.success('Cover letter copied to clipboard!')
  }

  if (!hasResumes) {
    return (
      <>
        {showAiOverlay && <AiLoadingOverlay />}
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">AI Customize</h1>
            <p className="text-muted-foreground mt-1">
              Tailor your resume for specific job descriptions using AI
            </p>
          </div>
          
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <div className="p-4 bg-muted rounded-full mb-4">
                <FileText className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">No resumes to customize</h3>
              <p className="text-muted-foreground text-center mb-4 max-w-sm">
                Create a resume first, then come back here to customize it for specific jobs.
              </p>
              <Link href="/resumes/new">
                <Button>Create Resume First</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </>
    )
  }

  if (customizationComplete) {
    return (
      <>
        {showAiOverlay && <AiLoadingOverlay />}
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Customization Complete!</h1>
            <p className="text-muted-foreground mt-1">
              Your resume and cover letter have been optimized for the job description
            </p>
          </div>

        {/* Combined Resume & Cover Letter Container */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Resume Card */}
          <Card className="bg-gradient-to-br from-violet-500/10 to-indigo-500/10 border-violet-500/20">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-violet-500/20 rounded-xl">
                    <FileText className="h-6 w-6 text-violet-600" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Customized Resume</CardTitle>
                    <CardDescription>ATS-optimized for this role</CardDescription>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button size="icon" variant="ghost" onClick={handlePreview} title="Preview Resume">
                    <Eye className="h-5 w-5 text-violet-600" />
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button size="icon" variant="ghost" title="Download Resume">
                        <Download className="h-5 w-5 text-violet-600" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleDownload('pdf')}>
                        <FileText className="mr-2 h-4 w-4" />
                        Download PDF
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDownload('docx')}>
                        <FileText className="mr-2 h-4 w-4" />
                        Download DOCX
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDownload('txt')}>
                        <FileText className="mr-2 h-4 w-4" />
                        Download TXT
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-white/50 rounded-lg">
                  <span className="text-sm font-medium">Match Score</span>
                  <span className="text-2xl font-bold text-violet-600">{optimizationStats.score}%</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-white/50 rounded-lg">
                  <span className="text-sm font-medium">Keywords Added</span>
                  <span className="text-lg font-semibold text-slate-700">{optimizationStats.keywords}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-white/50 rounded-lg">
                  <span className="text-sm font-medium">Sections Updated</span>
                  <span className="text-lg font-semibold text-slate-700">{optimizationStats.sections}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Cover Letter Card - Always show since it's auto-generated */}
          <Card className="bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border-emerald-500/20">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-emerald-500/20 rounded-xl">
                    <Mail className="h-6 w-6 text-emerald-600" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Cover Letter</CardTitle>
                    <CardDescription>Auto-generated and tailored to this position</CardDescription>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button 
                    size="icon" 
                    variant="ghost" 
                    onClick={() => setShowCoverLetter(!showCoverLetter)} 
                    title="Preview Cover Letter"
                  >
                    <Eye className="h-5 w-5 text-emerald-600" />
                  </Button>
                  <Button 
                    size="icon" 
                    variant="ghost" 
                    onClick={async () => {
                      if (coverLetter) {
                        await navigator.clipboard.writeText(coverLetter)
                        toast.success('Cover letter copied to clipboard!')
                      }
                    }} 
                    title="Copy Cover Letter"
                  >
                    <Copy className="h-5 w-5 text-emerald-600" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {coverLetter ? (
                showCoverLetter ? (
                  <div className="space-y-3">
                    <div className="p-4 bg-white/50 rounded-lg max-h-64 overflow-y-auto">
                      <p className="text-sm whitespace-pre-wrap leading-relaxed">{coverLetter}</p>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full"
                      onClick={() => setShowCoverLetter(false)}
                    >
                      <ChevronUp className="h-4 w-4 mr-2" />
                      Hide Cover Letter
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="p-4 bg-white/50 rounded-lg">
                      <p className="text-sm text-slate-600 line-clamp-4">{coverLetter.substring(0, 200)}...</p>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full"
                      onClick={() => setShowCoverLetter(true)}
                    >
                      <ChevronDown className="h-4 w-4 mr-2" />
                      Show Full Cover Letter
                    </Button>
                  </div>
                )
              ) : (
                <div className="p-4 bg-white/50 rounded-lg">
                  <div className="flex items-center justify-center gap-2 text-amber-600">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <p className="text-sm">Generating cover letter...</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-wrap gap-3 justify-center">
              <Button
                onClick={() => setShowQRCode(!showQRCode)}
                variant="outline"
                disabled={creatingPublicLink || !publicResumeSlug}
              >
                <QrCode className="mr-2 h-4 w-4" />
                {showQRCode ? 'Hide QR Code' : 'Show QR Code'}
              </Button>
              <Button
                onClick={handleCopyLink}
                variant="outline"
                disabled={creatingPublicLink || !publicResumeSlug}
              >
                <Copy className="mr-2 h-4 w-4" />
                Copy Share Link
              </Button>
            </div>

            {showQRCode && (
              <div className="mt-6 p-6 bg-white rounded-xl shadow-lg">
                {creatingPublicLink && (
                  <div className="flex items-center justify-center pb-4 text-sm text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Generating public link...
                  </div>
                )}
                <QRCodeSVG
                  value={getShareableLink()}
                  size={180}
                  level="H"
                  includeMargin={true}
                />
              </div>
            )}

            <div className="mt-6 flex gap-4">
              <Button variant="outline" onClick={handleReset}>
                Customize Another
              </Button>
              <Button onClick={handlePreview}>
                <Eye className="mr-2 h-4 w-4" />
                Preview Resume
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Optimization Summary */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 mb-2">
                <Target className="h-5 w-5 text-blue-500" />
                <h4 className="font-semibold">Keywords Added</h4>
              </div>
              <p className="text-2xl font-bold text-blue-600">{optimizationStats.keywords}</p>
              <p className="text-sm text-muted-foreground">Relevant keywords matched</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 mb-2">
                <Wand2 className="h-5 w-5 text-violet-500" />
                <h4 className="font-semibold">Sections Updated</h4>
              </div>
              <p className="text-2xl font-bold text-violet-600">{optimizationStats.sections}</p>
              <p className="text-sm text-muted-foreground">Experience bullets rewritten</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 mb-2">
                <Shield className="h-5 w-5 text-green-500" />
                <h4 className="font-semibold">ATS Score</h4>
              </div>
              <p className="text-2xl font-bold text-green-600">{optimizationStats.score}%</p>
              <p className="text-sm text-muted-foreground">Compatibility rating</p>
            </CardContent>
          </Card>
        </div>


        {/* AI Changes Made */}
        {aiSuggestions.changes.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wand2 className="h-5 w-5 text-violet-500" />
                Changes Made
              </CardTitle>
              <CardDescription>
                Here&apos;s what was optimized in your resume
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {aiSuggestions.changes.map((change, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm">
                    <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>{change}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        {/* Keywords Added */}
        {aiSuggestions.keywords_added.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-blue-500" />
                Keywords Added
              </CardTitle>
              <CardDescription>
                These keywords from the job description were incorporated
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {aiSuggestions.keywords_added.map((keyword, index) => (
                  <span 
                    key={index} 
                    className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm"
                  >
                    {keyword}
                  </span>
                ))}
              </div>
            </CardContent>
          </Card>
        )}


        {/* Share Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ExternalLink className="h-5 w-5" />
              Share Your Resume
            </CardTitle>
            <CardDescription>
              Share your optimized resume with recruiters or hiring managers
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Input 
                readOnly 
                value={getShareableLink()} 
                className="flex-1 bg-muted"
              />
              <Button onClick={handleCopyLink} variant="secondary">
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
        </div>
      </>
    )
  }

  // Show options selector if multiple options available
  if (showOptionsStep && aiOptions.length > 0) {
    return (
      <>
        {showAiOverlay && <AiLoadingOverlay />}
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-amber-500/25">
              <Sparkles className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-800 dark:text-slate-100">Select Your Option</h1>
              <p className="text-slate-500 dark:text-slate-400 text-sm">
                Choose and customize one of the AI-generated variations
              </p>
            </div>
          </div>
          
          <OptionSelector
            options={aiOptions}
            onSelect={handleOptionSelect}
            onCancel={handleCancelOptions}
          />
        </div>
      </>
    )
  }

  return (
    <>
      {showAiOverlay && <AiLoadingOverlay />}
      <div className="space-y-6">
      {/* Header with gradient accent */}
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-amber-500/25">
          <Sparkles className="h-6 w-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-800 dark:text-slate-100">AI Customize</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm">
            Tailor your resume for specific job descriptions using AI
          </p>
        </div>
      </div>

      {/* Progress Steps - Modern Design */}
      <div className="bg-slate-50 dark:bg-slate-900/50 rounded-xl p-4 border border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-4">
          <div className={`flex items-center gap-3 ${selectedResume ? 'text-emerald-600' : 'text-slate-500'}`}>
            <div className={`flex items-center justify-center w-9 h-9 rounded-full text-sm font-bold transition-all ${
              selectedResume 
                ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/30' 
                : 'bg-slate-200 dark:bg-slate-700 text-slate-500'
            }`}>
              {selectedResume ? <Check className="h-4 w-4" /> : '1'}
            </div>
            <span className="font-medium text-sm hidden sm:inline">Select Resume</span>
          </div>
          <div className={`flex-1 h-1 rounded-full transition-colors ${
            selectedResume ? 'bg-emerald-500' : 'bg-slate-200 dark:bg-slate-700'
          }`} />
          <div className={`flex items-center gap-3 ${jobDescriptionMethod ? 'text-emerald-600' : 'text-slate-500'}`}>
            <div className={`flex items-center justify-center w-9 h-9 rounded-full text-sm font-bold transition-all ${
              canStartCustomization 
                ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/30' 
                : jobDescriptionMethod
                  ? 'bg-amber-500 text-white shadow-md shadow-amber-500/30'
                  : 'bg-slate-200 dark:bg-slate-700 text-slate-500'
            }`}>
              {canStartCustomization ? <Check className="h-4 w-4" /> : '2'}
            </div>
            <span className="font-medium text-sm hidden sm:inline">Job Description</span>
          </div>
          <div className={`flex-1 h-1 rounded-full transition-colors ${
            canStartCustomization ? 'bg-emerald-500' : 'bg-slate-200 dark:bg-slate-700'
          }`} />
          <div className="flex items-center gap-3 text-slate-500">
            <div className="flex items-center justify-center w-9 h-9 rounded-full bg-slate-200 dark:bg-slate-700 text-sm font-bold">
              3
            </div>
            <span className="font-medium text-sm hidden sm:inline">Customize</span>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Step 1: Select Resume */}
        <Card className={selectedResume ? 'border-primary/50' : ''}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold ${
                  selectedResume ? 'bg-primary text-primary-foreground' : 'bg-primary text-primary-foreground'
                }`}>
                  {selectedResume ? <Check className="h-4 w-4" /> : '1'}
                </div>
                <CardTitle>Select Resume</CardTitle>
              </div>
              {selectedResume && (
                <Button variant="ghost" size="sm" onClick={() => setSelectedResume(null)}>
                  Change
                </Button>
              )}
            </div>
            <CardDescription>
              Choose the resume you want to customize
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {resumes.slice(0, 5).map((resume) => (
              <div
                key={resume.id}
                onClick={() => setSelectedResume(resume.id)}
                className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-colors ${
                  selectedResume === resume.id 
                    ? 'border-primary bg-primary/5' 
                    : 'hover:bg-accent'
                }`}
              >
                <div className="flex items-center gap-3">
                  <FileText className={`h-5 w-5 ${selectedResume === resume.id ? 'text-primary' : 'text-muted-foreground'}`} />
                  <div>
                    <p className="font-medium">{resume.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(resume.updated_at || resume.created_at || Date.now()).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                {selectedResume === resume.id && (
                  <Check className="h-5 w-5 text-primary" />
                )}
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Step 2: Add Job Description */}
        <Card className={canStartCustomization ? 'border-primary/50' : ''}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold ${
                  canStartCustomization ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                }`}>
                  {canStartCustomization ? <Check className="h-4 w-4" /> : '2'}
                </div>
                <CardTitle>Add Job Description</CardTitle>
              </div>
              {jobDescriptionMethod && (
                <Button variant="ghost" size="sm" onClick={() => {
                  setJobDescriptionMethod(null)
                  setJobDescription('')
                  setJobUrl('')
                }}>
                  Change
                </Button>
              )}
            </div>
            <CardDescription>
              Paste the job description or provide a URL
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {!jobDescriptionMethod ? (
              <div className="grid gap-4 md:grid-cols-2">
                <Card 
                  className="cursor-pointer hover:border-primary transition-colors"
                  onClick={() => setJobDescriptionMethod('text')}
                >
                  <CardContent className="pt-6 text-center">
                    <FileText className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                    <p className="font-medium">Paste Text</p>
                    <p className="text-sm text-muted-foreground">
                      Copy & paste job description
                    </p>
                  </CardContent>
                </Card>
                <Card 
                  className="cursor-pointer hover:border-primary transition-colors"
                  onClick={() => setJobDescriptionMethod('url')}
                >
                  <CardContent className="pt-6 text-center">
                    <LinkIcon className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                    <p className="font-medium">Enter URL</p>
                    <p className="text-sm text-muted-foreground">
                      We&apos;ll extract the content
                    </p>
                  </CardContent>
                </Card>
              </div>
            ) : jobDescriptionMethod === 'text' ? (
              <div className="space-y-2">
                <Label htmlFor="jobDescription">Job Description</Label>
                <Textarea
                  id="jobDescription"
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  placeholder="Paste the complete job description here..."
                  className="resize-none h-60 max-h-60 overflow-y-auto"
                />
                <p className="text-xs text-muted-foreground">
                  Include the full job posting for best results
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                <Label htmlFor="jobUrl">Job Posting URL</Label>
                <Input
                  id="jobUrl"
                  type="url"
                  value={jobUrl}
                  onChange={(e) => setJobUrl(e.target.value)}
                  placeholder="https://linkedin.com/jobs/..."
                />
                <p className="text-xs text-muted-foreground">
                  Supports LinkedIn, Indeed, Glassdoor, and most job boards
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* AI Customization Action */}
        <Card className="lg:col-span-2 bg-gradient-to-br from-violet-500/10 to-primary/10 border-violet-500/20">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-violet-500" />
              <CardTitle>AI-Powered Customization</CardTitle>
            </div>
            <CardDescription>
              Our AI will analyze the job description and optimize your resume
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3 mb-6">
              <div className="p-4 rounded-lg bg-background/50">
                <div className="flex items-center gap-2 mb-1">
                  <Target className="h-4 w-4 text-blue-500" />
                  <h4 className="font-medium">Keyword Optimization</h4>
                </div>
                <p className="text-sm text-muted-foreground">
                  Match your skills with job requirements
                </p>
              </div>
              <div className="p-4 rounded-lg bg-background/50">
                <div className="flex items-center gap-2 mb-1">
                  <Wand2 className="h-4 w-4 text-violet-500" />
                  <h4 className="font-medium">Content Rewriting</h4>
                </div>
                <p className="text-sm text-muted-foreground">
                  Tailor bullet points to highlight relevant experience
                </p>
              </div>
              <div className="p-4 rounded-lg bg-background/50">
                <div className="flex items-center gap-2 mb-1">
                  <Shield className="h-4 w-4 text-green-500" />
                  <h4 className="font-medium">ATS Compatibility</h4>
                </div>
                <p className="text-sm text-muted-foreground">
                  Ensure your resume passes applicant tracking systems
                </p>
              </div>
            </div>
            <div className="flex justify-center">
              <Button 
                size="lg" 
                disabled={!canStartCustomization || isCustomizing}
                onClick={handleStartCustomization}
              >
                {isCustomizing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Customizing...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Start Customization
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
            {!canStartCustomization && (
              <p className="text-center text-sm text-muted-foreground mt-4">
                Complete steps 1 and 2 to start customization
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Customization History */}
      {customizationHistory.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <History className="h-5 w-5" />
              Recent Customizations
            </CardTitle>
            <CardDescription>
              Your previously customized resumes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {customizationHistory.slice(0, 5).map((item) => (
                <div
                  key={item.id}
                  className="group relative flex items-center justify-between p-4 rounded-lg border hover:border-violet-300 hover:shadow-md transition-all bg-white"
                >
                  <div className="flex items-center gap-4 flex-1">
                    <div className="p-2 rounded-lg bg-violet-50 group-hover:bg-violet-100 transition-colors">
                      <FileText className="h-5 w-5 text-violet-600" />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-slate-900">
                        {item.title}
                      </p>
                      <div className="flex items-center gap-3 mt-1">
                        <div className="flex items-center gap-1.5 text-sm text-slate-500">
                          <Clock className="h-3.5 w-3.5" />
                          {new Date(item.created_at || Date.now()).toLocaleDateString()}
                        </div>
                        {item.match_score && (
                          <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200">
                            <span className="text-sm font-semibold text-emerald-700">
                              {item.match_score}% match
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="hover:bg-violet-50 hover:text-violet-700"
                      onClick={(e) => {
                        e.stopPropagation()
                        window.location.href = `/r/${item.id}`
                      }}
                      title="View Customized Resume"
                    >
                      <FileText className="h-4 w-4" />
                    </Button>
                    {item.cover_letter && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="hover:bg-emerald-50 hover:text-emerald-700"
                        onClick={(e) => {
                          e.stopPropagation()
                          setCoverLetter(item.cover_letter || '')
                          setShowCoverLetter(true)
                          toast.success('Cover letter loaded')
                        }}
                        title="View Cover Letter"
                      >
                        <Mail className="h-4 w-4" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="hover:bg-violet-50 hover:text-violet-700"
                      onClick={(e) => {
                        e.stopPropagation()
                        window.open(`/r/${item.id}?download=true`, '_blank')
                      }}
                      title="Download Customized Resume"
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
      </div>

      {/* Upgrade Modal */}
      <UpgradeModal
        open={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        feature="customizations"
        current={upgradeInfo.current}
        limit={upgradeInfo.limit}
        tier={upgradeInfo.tier}
        isTrialActive={upgradeInfo.isTrialActive}
      />
    </>
  )
}
