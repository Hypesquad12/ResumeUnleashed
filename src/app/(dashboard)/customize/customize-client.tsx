'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { 
  Sparkles, FileText, Link as LinkIcon, ArrowRight, Check, 
  Loader2, Wand2, Target, Shield, Download, Eye, QrCode, Copy, ExternalLink, History, Clock
} from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'
import { QRCodeSVG } from 'qrcode.react'
import { createClient } from '@/lib/supabase/client'

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
}

interface CustomizeClientProps {
  resumes: Resume[]
  history?: CustomizationHistory[]
}

export function CustomizeClient({ resumes, history = [] }: CustomizeClientProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const preselectedResumeId = searchParams.get('resume')
  
  const [selectedResume, setSelectedResume] = useState<string | null>(preselectedResumeId)
  const [jobDescriptionMethod, setJobDescriptionMethod] = useState<'text' | 'url' | null>(null)
  const [jobDescription, setJobDescription] = useState('')
  const [jobUrl, setJobUrl] = useState('')
  const [isCustomizing, setIsCustomizing] = useState(false)
  const [customizationComplete, setCustomizationComplete] = useState(false)
  const [customizedResumeId, setCustomizedResumeId] = useState<string | null>(null)
  const [showQRCode, setShowQRCode] = useState(false)
  const [customizationHistory, setCustomizationHistory] = useState<CustomizationHistory[]>(history)
  const [optimizationStats, setOptimizationStats] = useState({ keywords: 0, sections: 0, score: 0 })

  const hasResumes = resumes.length > 0
  const canStartCustomization = selectedResume && (jobDescription.trim() || jobUrl.trim())

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

      // Simulate AI processing (replace with actual API call later)
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Generate random optimization stats for demo
      const stats = {
        keywords: Math.floor(Math.random() * 10) + 8,
        sections: Math.floor(Math.random() * 3) + 2,
        score: Math.floor(Math.random() * 15) + 85
      }
      setOptimizationStats(stats)

      // Save to customized_resumes table
      const { data: customized, error } = await supabase
        .from('customized_resumes')
        .insert({
          user_id: user.id,
          source_resume_id: selectedResume,
          title: `${sourceResume.title} - Customized`,
          customized_content: {
            contact: sourceResume.contact,
            summary: sourceResume.summary,
            experience: sourceResume.experience,
            education: sourceResume.education,
            skills: sourceResume.skills,
          },
          ai_suggestions: {
            keywords_added: stats.keywords,
            sections_updated: stats.sections,
            job_description: jobDescription || jobUrl,
          },
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
        }, ...prev])
      }
      
      toast.success('Resume customization complete!')
      setCustomizationComplete(true)
    } catch (error) {
      console.error('Customization error:', error)
      toast.error('Failed to customize resume')
    } finally {
      setIsCustomizing(false)
    }
  }

  const handleDownloadPDF = async () => {
    // Use the source resume for preview since customized_resumes doesn't have a preview page yet
    const resumeId = selectedResume || customizedResumeId
    if (!resumeId) {
      toast.error('No resume selected')
      return
    }
    
    toast.info('Opening print dialog...')
    window.open(`/resumes/${resumeId}/preview?download=true`, '_blank')
  }

  const handlePreview = () => {
    // Use the source resume for preview
    const resumeId = selectedResume || customizedResumeId
    if (!resumeId) {
      toast.error('No resume selected')
      return
    }
    window.open(`/resumes/${resumeId}/preview`, '_blank')
  }

  const getShareableLink = () => {
    if (!customizedResumeId) return ''
    return `${window.location.origin}/resumes/${customizedResumeId}/preview`
  }

  const handleCopyLink = async () => {
    const link = getShareableLink()
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
  }

  if (!hasResumes) {
    return (
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
    )
  }

  if (customizationComplete) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Customization Complete!</h1>
          <p className="text-muted-foreground mt-1">
            Your resume has been optimized for the job description
          </p>
        </div>

        <Card className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-500/20">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="p-4 bg-green-500/20 rounded-full mb-4">
              <Check className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Resume Optimized Successfully</h3>
            <p className="text-muted-foreground text-center mb-6 max-w-md">
              Your customized resume is ready. It has been optimized with relevant keywords 
              and tailored content to match the job requirements.
            </p>
            
            {/* Action Buttons */}
            <div className="flex flex-wrap justify-center gap-3 mb-6">
              <Button onClick={handlePreview} variant="outline">
                <Eye className="mr-2 h-4 w-4" />
                Preview
              </Button>
              <Button onClick={handleDownloadPDF} variant="outline">
                <Download className="mr-2 h-4 w-4" />
                Download PDF
              </Button>
              <Button onClick={() => setShowQRCode(!showQRCode)} variant="outline">
                <QrCode className="mr-2 h-4 w-4" />
                {showQRCode ? 'Hide QR Code' : 'Show QR Code'}
              </Button>
              <Button onClick={handleCopyLink} variant="outline">
                <Copy className="mr-2 h-4 w-4" />
                Copy Link
              </Button>
            </div>

            {/* QR Code Section */}
            {showQRCode && (
              <div className="mb-6 p-6 bg-white rounded-xl shadow-lg">
                <QRCodeSVG 
                  value={getShareableLink()} 
                  size={180}
                  level="H"
                  includeMargin={true}
                />
                <p className="text-center text-sm text-muted-foreground mt-3">
                  Scan to view resume
                </p>
              </div>
            )}

            <div className="flex gap-4">
              <Button variant="outline" onClick={handleReset}>
                Customize Another
              </Button>
              <Link href="/resumes">
                <Button>
                  View Resumes
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
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
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">AI Customize</h1>
        <p className="text-muted-foreground mt-1">
          Tailor your resume for specific job descriptions using AI
        </p>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center gap-4 mb-8">
        <div className={`flex items-center gap-2 ${selectedResume ? 'text-primary' : 'text-muted-foreground'}`}>
          <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold ${
            selectedResume ? 'bg-primary text-primary-foreground' : 'bg-muted'
          }`}>
            {selectedResume ? <Check className="h-4 w-4" /> : '1'}
          </div>
          <span className="font-medium">Select Resume</span>
        </div>
        <div className="flex-1 h-px bg-border" />
        <div className={`flex items-center gap-2 ${jobDescriptionMethod ? 'text-primary' : 'text-muted-foreground'}`}>
          <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold ${
            jobDescriptionMethod ? 'bg-primary text-primary-foreground' : 'bg-muted'
          }`}>
            {canStartCustomization ? <Check className="h-4 w-4" /> : '2'}
          </div>
          <span className="font-medium">Job Description</span>
        </div>
        <div className="flex-1 h-px bg-border" />
        <div className="flex items-center gap-2 text-muted-foreground">
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-muted text-sm font-bold">
            3
          </div>
          <span className="font-medium">Customize</span>
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
                  placeholder="Paste the full job description here..."
                  rows={8}
                  className="resize-none"
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
                  className="flex items-center justify-between p-3 rounded-lg border hover:bg-accent transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{item.title}</p>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {new Date(item.created_at || Date.now()).toLocaleDateString()}
                        {item.match_score && (
                          <span className="ml-2 text-green-600 font-medium">
                            {item.match_score}% match
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        if (item.source_resume_id) {
                          window.open(`/resumes/${item.source_resume_id}/preview`, '_blank')
                        }
                      }}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        if (item.source_resume_id) {
                          window.open(`/resumes/${item.source_resume_id}/preview?download=true`, '_blank')
                        }
                      }}
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
  )
}
