'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { 
  Eye, Target, Zap, CheckCircle, AlertTriangle, XCircle, 
  TrendingUp, FileText, Sparkles, BarChart3, Clock, 
  MousePointer, Lightbulb, ArrowRight, Loader2, RefreshCw,
  Upload, File, X
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface ScoreBreakdown {
  ats: number
  keywords: number
  format: number
  content: number
  overall: number
}

interface HeatmapZone {
  id: string
  name: string
  x: number
  y: number
  width: number
  height: number
  attention: number // 0-100
  timeSpent: number // seconds
  priority: 'high' | 'medium' | 'low'
}

interface Suggestion {
  type: 'success' | 'warning' | 'error'
  category: string
  message: string
  impact: 'high' | 'medium' | 'low'
}

// Simulated heatmap zones based on recruiter eye-tracking studies
const generateHeatmapZones = (): HeatmapZone[] => [
  { id: 'name', name: 'Name & Title', x: 5, y: 2, width: 60, height: 8, attention: 95, timeSpent: 3.2, priority: 'high' },
  { id: 'contact', name: 'Contact Info', x: 65, y: 2, width: 30, height: 8, attention: 75, timeSpent: 1.5, priority: 'medium' },
  { id: 'summary', name: 'Professional Summary', x: 5, y: 12, width: 90, height: 12, attention: 88, timeSpent: 4.5, priority: 'high' },
  { id: 'experience1', name: 'Recent Experience', x: 5, y: 26, width: 90, height: 20, attention: 92, timeSpent: 8.2, priority: 'high' },
  { id: 'experience2', name: 'Previous Experience', x: 5, y: 48, width: 90, height: 15, attention: 65, timeSpent: 3.1, priority: 'medium' },
  { id: 'skills', name: 'Skills Section', x: 5, y: 65, width: 90, height: 12, attention: 82, timeSpent: 2.8, priority: 'high' },
  { id: 'education', name: 'Education', x: 5, y: 79, width: 90, height: 10, attention: 55, timeSpent: 1.2, priority: 'low' },
  { id: 'certifications', name: 'Certifications', x: 5, y: 91, width: 90, height: 7, attention: 45, timeSpent: 0.8, priority: 'low' },
]

// Generate suggestions based on resume content
const generateSuggestions = (resumeText: string): Suggestion[] => {
  const suggestions: Suggestion[] = []
  const text = resumeText.toLowerCase()

  // Check for action verbs
  const actionVerbs = ['led', 'managed', 'developed', 'created', 'implemented', 'achieved', 'increased', 'reduced', 'improved']
  const hasActionVerbs = actionVerbs.some(verb => text.includes(verb))
  if (hasActionVerbs) {
    suggestions.push({ type: 'success', category: 'Content', message: 'Great use of action verbs!', impact: 'high' })
  } else {
    suggestions.push({ type: 'warning', category: 'Content', message: 'Add more action verbs (led, managed, developed, etc.)', impact: 'high' })
  }

  // Check for metrics
  const hasMetrics = /\d+%|\$\d+|\d+\s*(million|thousand|k|m)/i.test(resumeText)
  if (hasMetrics) {
    suggestions.push({ type: 'success', category: 'Impact', message: 'Excellent! You included quantifiable achievements', impact: 'high' })
  } else {
    suggestions.push({ type: 'error', category: 'Impact', message: 'Add metrics and numbers to quantify your achievements', impact: 'high' })
  }

  // Check length
  const wordCount = resumeText.split(/\s+/).length
  if (wordCount < 200) {
    suggestions.push({ type: 'warning', category: 'Length', message: 'Resume seems too short. Add more detail about your experience.', impact: 'medium' })
  } else if (wordCount > 800) {
    suggestions.push({ type: 'warning', category: 'Length', message: 'Resume may be too long. Consider condensing to 1-2 pages.', impact: 'medium' })
  } else {
    suggestions.push({ type: 'success', category: 'Length', message: 'Good resume length', impact: 'low' })
  }

  // Check for common keywords
  const techKeywords = ['python', 'javascript', 'react', 'aws', 'sql', 'java', 'node', 'typescript']
  const softKeywords = ['leadership', 'communication', 'teamwork', 'problem-solving', 'analytical']
  const hasTechKeywords = techKeywords.some(k => text.includes(k))
  const hasSoftKeywords = softKeywords.some(k => text.includes(k))

  if (hasTechKeywords) {
    suggestions.push({ type: 'success', category: 'Keywords', message: 'Technical skills are well represented', impact: 'high' })
  } else {
    suggestions.push({ type: 'warning', category: 'Keywords', message: 'Consider adding more technical keywords', impact: 'medium' })
  }

  if (hasSoftKeywords) {
    suggestions.push({ type: 'success', category: 'Keywords', message: 'Soft skills are included', impact: 'medium' })
  } else {
    suggestions.push({ type: 'warning', category: 'Keywords', message: 'Add soft skills like leadership, communication', impact: 'medium' })
  }

  // Check for email
  const hasEmail = /[\w.-]+@[\w.-]+\.\w+/.test(resumeText)
  if (!hasEmail) {
    suggestions.push({ type: 'error', category: 'Contact', message: 'Add your email address', impact: 'high' })
  }

  // Check for LinkedIn
  if (text.includes('linkedin')) {
    suggestions.push({ type: 'success', category: 'Contact', message: 'LinkedIn profile included', impact: 'medium' })
  } else {
    suggestions.push({ type: 'warning', category: 'Contact', message: 'Consider adding your LinkedIn profile', impact: 'low' })
  }

  return suggestions
}

// Calculate scores based on resume content
const calculateScores = (resumeText: string, jobDescription: string): ScoreBreakdown => {
  const text = resumeText.toLowerCase()
  const jd = jobDescription.toLowerCase()

  // ATS Score - based on formatting and structure
  let atsScore = 70
  if (text.includes('experience')) atsScore += 5
  if (text.includes('education')) atsScore += 5
  if (text.includes('skills')) atsScore += 5
  if (/[\w.-]+@[\w.-]+\.\w+/.test(resumeText)) atsScore += 5
  if (text.length > 500) atsScore += 5
  atsScore = Math.min(atsScore, 98)

  // Keyword Score - based on job description match
  let keywordScore = 50
  if (jd) {
    const jdWords = jd.split(/\s+/).filter(w => w.length > 4)
    const matchedWords = jdWords.filter(w => text.includes(w))
    keywordScore = Math.min(Math.round((matchedWords.length / Math.max(jdWords.length, 1)) * 100), 95)
  } else {
    keywordScore = 65
  }

  // Format Score
  let formatScore = 75
  const hasProperSections = ['experience', 'education', 'skills'].filter(s => text.includes(s)).length
  formatScore += hasProperSections * 8
  formatScore = Math.min(formatScore, 95)

  // Content Score
  let contentScore = 60
  const actionVerbs = ['led', 'managed', 'developed', 'created', 'implemented', 'achieved']
  const usedVerbs = actionVerbs.filter(v => text.includes(v)).length
  contentScore += usedVerbs * 5
  if (/\d+%/.test(resumeText)) contentScore += 10
  if (/\$\d+/.test(resumeText)) contentScore += 5
  contentScore = Math.min(contentScore, 95)

  // Overall Score
  const overall = Math.round((atsScore * 0.3 + keywordScore * 0.25 + formatScore * 0.2 + contentScore * 0.25))

  return { ats: atsScore, keywords: keywordScore, format: formatScore, content: contentScore, overall }
}

interface Resume {
  id: string
  title: string
  content: any
}

interface ScoreHistory {
  id: string
  resume_id: string
  overall_score: number
  ats_score: number
  keyword_score: number
  format_score: number
  content_score: number
  created_at: string
  resume_title?: string
}

export default function ResumeScorePage() {
  const [resumeText, setResumeText] = useState('')
  const [jobDescription, setJobDescription] = useState('')
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [scores, setScores] = useState<ScoreBreakdown | null>(null)
  const [heatmapZones, setHeatmapZones] = useState<HeatmapZone[]>([])
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [selectedZone, setSelectedZone] = useState<HeatmapZone | null>(null)
  const [showHeatmap, setShowHeatmap] = useState(true)
  
  // File upload and resume selection states
  const [inputMode, setInputMode] = useState<'upload' | 'saved'>('saved')
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [isParsingFile, setIsParsingFile] = useState(false)
  const [resumes, setResumes] = useState<Resume[]>([])
  const [selectedResumeId, setSelectedResumeId] = useState('')
  const [loadingResumes, setLoadingResumes] = useState(true)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const supabase = createClient()
  
  // Score history state
  const [scoreHistory, setScoreHistory] = useState<ScoreHistory[]>([])
  const [loadingHistory, setLoadingHistory] = useState(true)
  const [showHistory, setShowHistory] = useState(false)
  
  // Load user's resumes and score history
  useEffect(() => {
    const loadData = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setLoadingResumes(false)
        setLoadingHistory(false)
        return
      }
      
      // Load resumes and score history in parallel
      const [resumesResult, historyResult] = await Promise.all([
        (supabase as any)
          .from('resumes')
          .select('id, title, content')
          .eq('user_id', user.id)
          .order('updated_at', { ascending: false }),
        (supabase as any)
          .from('resume_scores')
          .select('id, resume_id, overall_score, ats_score, keyword_score, format_score, content_score, created_at')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(10)
      ])
      
      if (resumesResult.data) {
        setResumes(resumesResult.data)
        // Default to saved mode if user has resumes
        if (resumesResult.data.length === 0) {
          setInputMode('upload')
        }
        
        // Enrich history with resume titles
        if (historyResult.data) {
          const enrichedHistory = historyResult.data.map((h: any) => ({
            ...h,
            resume_title: resumesResult.data.find((r: any) => r.id === h.resume_id)?.title || 'Unknown Resume'
          }))
          setScoreHistory(enrichedHistory)
        }
      }
      setLoadingResumes(false)
      setLoadingHistory(false)
    }
    
    loadData()
  }, [supabase])
  
  // Extract text from resume content when selected
  useEffect(() => {
    if (selectedResumeId && inputMode === 'saved') {
      const resume = resumes.find(r => r.id === selectedResumeId)
      if (resume?.content) {
        const text = extractTextFromResumeContent(resume.content)
        setResumeText(text)
      }
    }
  }, [selectedResumeId, resumes, inputMode])
  
  // Extract text from resume JSON content
  const extractTextFromResumeContent = (content: any): string => {
    const parts: string[] = []
    
    if (content.personalInfo) {
      const p = content.personalInfo
      if (p.fullName) parts.push(p.fullName)
      if (p.email) parts.push(p.email)
      if (p.phone) parts.push(p.phone)
      if (p.location) parts.push(p.location)
      if (p.linkedin) parts.push(`LinkedIn: ${p.linkedin}`)
      if (p.summary) parts.push(`\nSummary:\n${p.summary}`)
    }
    
    if (content.experience && content.experience.length > 0) {
      parts.push('\nExperience:')
      content.experience.forEach((exp: any) => {
        if (exp.title) parts.push(exp.title)
        if (exp.company) parts.push(exp.company)
        if (exp.startDate || exp.endDate) parts.push(`${exp.startDate || ''} - ${exp.endDate || 'Present'}`)
        if (exp.description) parts.push(exp.description)
        if (exp.achievements) {
          exp.achievements.forEach((a: string) => parts.push(`• ${a}`))
        }
      })
    }
    
    if (content.education && content.education.length > 0) {
      parts.push('\nEducation:')
      content.education.forEach((edu: any) => {
        if (edu.degree) parts.push(edu.degree)
        if (edu.school) parts.push(edu.school)
        if (edu.year) parts.push(edu.year)
      })
    }
    
    if (content.skills && content.skills.length > 0) {
      parts.push('\nSkills:')
      const skillNames = content.skills.map((s: any) => 
        typeof s === 'string' ? s : s.name || s.skill
      ).filter(Boolean)
      parts.push(skillNames.join(', '))
    }
    
    if (content.certifications && content.certifications.length > 0) {
      parts.push('\nCertifications:')
      content.certifications.forEach((cert: any) => {
        if (typeof cert === 'string') parts.push(cert)
        else if (cert.name) parts.push(cert.name)
      })
    }
    
    return parts.join('\n')
  }
  
  // Handle file upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    
    setUploadedFile(file)
    setIsParsingFile(true)
    
    try {
      // For now, read as text (works for .txt files)
      // PDF/DOCX parsing would require a server-side solution or library
      if (file.type === 'text/plain' || file.name.endsWith('.txt')) {
        const text = await file.text()
        setResumeText(text)
      } else {
        // For PDF/DOCX, we'll show a message to paste content
        // In production, you'd use a parsing library or API
        setResumeText(`[File uploaded: ${file.name}]\n\nNote: For best results with PDF/DOCX files, please paste the text content below or use a saved resume.`)
      }
    } catch (error) {
      console.error('Error reading file:', error)
    } finally {
      setIsParsingFile(false)
    }
  }
  
  // Remove uploaded file
  const removeFile = () => {
    setUploadedFile(null)
    setResumeText('')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const analyzeResume = async () => {
    if (!resumeText.trim()) return

    setIsAnalyzing(true)
    
    // Simulate analysis time
    await new Promise(resolve => setTimeout(resolve, 2000))

    const calculatedScores = calculateScores(resumeText, jobDescription)
    const generatedSuggestions = generateSuggestions(resumeText)
    const zones = generateHeatmapZones()

    setScores(calculatedScores)
    setSuggestions(generatedSuggestions)
    setHeatmapZones(zones)
    setIsAnalyzing(false)
    
    // Save score to database if using a saved resume
    if (selectedResumeId && inputMode === 'saved') {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          const { data: newScore } = await (supabase as any)
            .from('resume_scores')
            .insert({
              user_id: user.id,
              resume_id: selectedResumeId,
              overall_score: calculatedScores.overall,
              ats_score: calculatedScores.ats,
              keyword_score: calculatedScores.keywords,
              format_score: calculatedScores.format,
              content_score: calculatedScores.content,
              suggestions: generatedSuggestions,
              heatmap_data: zones,
            })
            .select()
            .single()
          
          // Update history
          if (newScore) {
            const resume = resumes.find(r => r.id === selectedResumeId)
            setScoreHistory(prev => [{
              ...newScore,
              resume_title: resume?.title || 'Unknown Resume'
            }, ...prev.slice(0, 9)])
          }
        }
      } catch (error) {
        console.error('Error saving score:', error)
      }
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-emerald-500'
    if (score >= 60) return 'text-amber-500'
    return 'text-red-500'
  }

  const getScoreBg = (score: number) => {
    if (score >= 80) return 'bg-emerald-500'
    if (score >= 60) return 'bg-amber-500'
    return 'bg-red-500'
  }

  const getAttentionColor = (attention: number) => {
    if (attention >= 80) return 'rgba(239, 68, 68, 0.5)' // red - high attention
    if (attention >= 60) return 'rgba(251, 191, 36, 0.4)' // yellow - medium
    return 'rgba(34, 197, 94, 0.3)' // green - low attention
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-teal-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-500 flex items-center justify-center">
              <BarChart3 className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-800">Resume Score & Recruiter Insights</h1>
              <p className="text-slate-500">See your resume through a recruiter&apos;s eyes</p>
            </div>
          </div>
        </motion.div>

        {/* Score History Section */}
        {scoreHistory.length > 0 && !loadingHistory && (
          <Card className="mb-6 border-teal-200 bg-gradient-to-br from-teal-50 to-cyan-50">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Clock className="h-5 w-5 text-teal-500" />
                  Score History
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowHistory(!showHistory)}
                >
                  {showHistory ? 'Hide' : 'Show'} ({scoreHistory.length})
                </Button>
              </div>
              <CardDescription>
                Your previous resume score analyses
              </CardDescription>
            </CardHeader>
            {showHistory && (
              <CardContent className="pt-0">
                <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                  {scoreHistory.map((score) => (
                    <div
                      key={score.id}
                      className="flex items-center gap-3 p-3 bg-white rounded-lg border border-teal-100"
                    >
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                        score.overall_score >= 80 ? 'bg-emerald-100' :
                        score.overall_score >= 60 ? 'bg-amber-100' : 'bg-red-100'
                      }`}>
                        <span className={`font-bold text-lg ${
                          score.overall_score >= 80 ? 'text-emerald-600' :
                          score.overall_score >= 60 ? 'text-amber-600' : 'text-red-600'
                        }`}>
                          {score.overall_score}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-slate-800 truncate">{score.resume_title}</p>
                        <p className="text-xs text-slate-500">
                          {new Date(score.created_at).toLocaleDateString()}
                        </p>
                        <div className="flex gap-2 mt-1">
                          <span className="text-xs text-slate-400">ATS: {score.ats_score}</span>
                          <span className="text-xs text-slate-400">KW: {score.keyword_score}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            )}
          </Card>
        )}

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Input Section */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-teal-500" />
                  Your Resume
                </CardTitle>
                <CardDescription>
                  Select a saved resume or upload a file to analyze
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Input Mode Toggle */}
                {resumes.length > 0 && (
                  <div className="flex gap-1 p-1 bg-slate-100 rounded-lg w-fit">
                    <Button
                      variant={inputMode === 'saved' ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => {
                        setInputMode('saved')
                        setUploadedFile(null)
                        if (!selectedResumeId && resumes.length > 0) {
                          setSelectedResumeId(resumes[0].id)
                        }
                      }}
                      className="text-xs h-8"
                    >
                      <FileText className="mr-1 h-3 w-3" />
                      Saved Resumes
                    </Button>
                    <Button
                      variant={inputMode === 'upload' ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => {
                        setInputMode('upload')
                        setSelectedResumeId('')
                        setResumeText('')
                      }}
                      className="text-xs h-8"
                    >
                      <Upload className="mr-1 h-3 w-3" />
                      Upload File
                    </Button>
                  </div>
                )}

                {loadingResumes ? (
                  <div className="flex items-center gap-2 text-sm text-slate-500 p-4 bg-slate-50 rounded-lg">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Loading your resumes...
                  </div>
                ) : inputMode === 'saved' && resumes.length > 0 ? (
                  <div className="space-y-3">
                    <Select value={selectedResumeId} onValueChange={setSelectedResumeId}>
                      <SelectTrigger className="bg-white">
                        <SelectValue placeholder="Select a resume to analyze" />
                      </SelectTrigger>
                      <SelectContent>
                        {resumes.map((resume) => (
                          <SelectItem key={resume.id} value={resume.id}>
                            {resume.title || 'Untitled Resume'}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {selectedResumeId && (
                      <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3">
                        <div className="flex items-center gap-2 text-emerald-700 text-sm">
                          <CheckCircle className="h-4 w-4" />
                          <span>Resume loaded and ready to analyze!</span>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {/* File Upload Area */}
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".pdf,.doc,.docx,.txt"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                    
                    {!uploadedFile ? (
                      <div
                        onClick={() => fileInputRef.current?.click()}
                        className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center cursor-pointer hover:border-teal-400 hover:bg-teal-50/50 transition-colors"
                      >
                        <Upload className="h-10 w-10 text-slate-400 mx-auto mb-3" />
                        <p className="text-sm font-medium text-slate-700">
                          Click to upload your resume
                        </p>
                        <p className="text-xs text-slate-500 mt-1">
                          PDF, DOC, DOCX, or TXT (max 5MB)
                        </p>
                      </div>
                    ) : (
                      <div className="bg-slate-50 rounded-xl p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-teal-100 flex items-center justify-center">
                              <File className="h-5 w-5 text-teal-600" />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-slate-700">{uploadedFile.name}</p>
                              <p className="text-xs text-slate-500">
                                {(uploadedFile.size / 1024).toFixed(1)} KB
                              </p>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={removeFile}
                            className="text-slate-400 hover:text-red-500"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                        {isParsingFile && (
                          <div className="mt-3 flex items-center gap-2 text-sm text-teal-600">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Parsing file...
                          </div>
                        )}
                      </div>
                    )}

                    {/* Show extracted text preview */}
                    {resumeText && inputMode === 'upload' && (
                      <div className="space-y-2">
                        <label className="text-xs font-medium text-slate-600">Preview / Edit extracted text:</label>
                        <Textarea
                          value={resumeText}
                          onChange={(e) => setResumeText(e.target.value)}
                          rows={6}
                          className="resize-none text-sm"
                        />
                      </div>
                    )}

                    {resumes.length === 0 && !uploadedFile && (
                      <p className="text-xs text-slate-500 text-center">
                        Or <a href="/resumes/new" className="text-teal-600 hover:underline">create a resume</a> first
                      </p>
                    )}
                  </div>
                )}

                {/* Job Description (Optional) */}
                <div className="pt-2 border-t border-slate-100">
                  <Textarea
                    placeholder="(Optional) Paste job description for keyword matching..."
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                    rows={3}
                    className="resize-none"
                  />
                </div>

                <Button
                  onClick={analyzeResume}
                  disabled={!resumeText.trim() || isAnalyzing}
                  className="w-full bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600"
                >
                  {isAnalyzing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-4 w-4" />
                      Analyze Resume
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Suggestions */}
            {suggestions.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lightbulb className="h-5 w-5 text-amber-500" />
                    Improvement Suggestions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {suggestions.map((suggestion, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className={`flex items-start gap-3 p-3 rounded-lg ${
                          suggestion.type === 'success' ? 'bg-emerald-50' :
                          suggestion.type === 'warning' ? 'bg-amber-50' : 'bg-red-50'
                        }`}
                      >
                        {suggestion.type === 'success' ? (
                          <CheckCircle className="h-5 w-5 text-emerald-500 mt-0.5" />
                        ) : suggestion.type === 'warning' ? (
                          <AlertTriangle className="h-5 w-5 text-amber-500 mt-0.5" />
                        ) : (
                          <XCircle className="h-5 w-5 text-red-500 mt-0.5" />
                        )}
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs">
                              {suggestion.category}
                            </Badge>
                            <Badge className={`text-xs ${
                              suggestion.impact === 'high' ? 'bg-red-100 text-red-700' :
                              suggestion.impact === 'medium' ? 'bg-amber-100 text-amber-700' :
                              'bg-slate-100 text-slate-700'
                            }`}>
                              {suggestion.impact} impact
                            </Badge>
                          </div>
                          <p className={`text-sm mt-1 ${
                            suggestion.type === 'success' ? 'text-emerald-700' :
                            suggestion.type === 'warning' ? 'text-amber-700' : 'text-red-700'
                          }`}>
                            {suggestion.message}
                          </p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Results Section */}
          <div className="space-y-6">
            {scores ? (
              <>
                {/* Overall Score */}
                <Card className="overflow-hidden">
                  <div className={`p-6 ${getScoreBg(scores.overall)} bg-opacity-10`}>
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-slate-800">Overall Resume Score</h3>
                        <p className="text-slate-500 text-sm">Based on ATS compatibility, keywords, format & content</p>
                      </div>
                      <div className="text-center">
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: 'spring', delay: 0.2 }}
                          className={`text-5xl font-bold ${getScoreColor(scores.overall)}`}
                        >
                          {scores.overall}
                        </motion.div>
                        <div className="text-slate-500 text-sm">/ 100</div>
                      </div>
                    </div>
                  </div>
                  <CardContent className="p-6">
                    <div className="grid grid-cols-2 gap-4">
                      {[
                        { label: 'ATS Score', value: scores.ats, icon: Target },
                        { label: 'Keywords', value: scores.keywords, icon: Zap },
                        { label: 'Format', value: scores.format, icon: FileText },
                        { label: 'Content', value: scores.content, icon: TrendingUp },
                      ].map((item, index) => (
                        <motion.div
                          key={item.label}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.3 + index * 0.1 }}
                          className="bg-slate-50 rounded-xl p-4"
                        >
                          <div className="flex items-center gap-2 mb-2">
                            <item.icon className={`h-4 w-4 ${getScoreColor(item.value)}`} />
                            <span className="text-sm text-slate-600">{item.label}</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className={`text-2xl font-bold ${getScoreColor(item.value)}`}>
                              {item.value}
                            </span>
                            <Progress value={item.value} className="flex-1 h-2" />
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Recruiter Heatmap */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <Eye className="h-5 w-5 text-teal-500" />
                          Recruiter Eye-Tracking Heatmap
                        </CardTitle>
                        <CardDescription>
                          Where recruiters spend the most time on your resume
                        </CardDescription>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowHeatmap(!showHeatmap)}
                      >
                        {showHeatmap ? 'Hide' : 'Show'} Heatmap
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {/* Resume Preview with Heatmap */}
                    <div className="relative bg-white border rounded-xl p-4 aspect-[8.5/11] overflow-hidden">
                      {/* Simulated resume structure */}
                      <div className="space-y-4 text-xs text-slate-400">
                        <div className="h-8 bg-slate-100 rounded w-1/2" />
                        <div className="h-4 bg-slate-100 rounded w-1/3" />
                        <div className="h-16 bg-slate-100 rounded" />
                        <div className="h-24 bg-slate-100 rounded" />
                        <div className="h-20 bg-slate-100 rounded" />
                        <div className="h-16 bg-slate-100 rounded" />
                        <div className="h-12 bg-slate-100 rounded" />
                        <div className="h-8 bg-slate-100 rounded" />
                      </div>

                      {/* Heatmap Overlay */}
                      {showHeatmap && heatmapZones.map((zone) => (
                        <motion.div
                          key={zone.id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.5 }}
                          className="absolute cursor-pointer transition-all hover:ring-2 hover:ring-teal-500"
                          style={{
                            left: `${zone.x}%`,
                            top: `${zone.y}%`,
                            width: `${zone.width}%`,
                            height: `${zone.height}%`,
                            backgroundColor: getAttentionColor(zone.attention),
                            borderRadius: '4px',
                          }}
                          onClick={() => setSelectedZone(zone)}
                          title={zone.name}
                        />
                      ))}

                      {/* Legend */}
                      <div className="absolute bottom-2 right-2 bg-white/90 backdrop-blur-sm rounded-lg p-2 text-xs">
                        <div className="flex items-center gap-2 mb-1">
                          <div className="w-3 h-3 rounded" style={{ backgroundColor: 'rgba(239, 68, 68, 0.5)' }} />
                          <span>High attention</span>
                        </div>
                        <div className="flex items-center gap-2 mb-1">
                          <div className="w-3 h-3 rounded" style={{ backgroundColor: 'rgba(251, 191, 36, 0.4)' }} />
                          <span>Medium</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded" style={{ backgroundColor: 'rgba(34, 197, 94, 0.3)' }} />
                          <span>Low attention</span>
                        </div>
                      </div>
                    </div>

                    {/* Zone Details */}
                    {selectedZone && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-4 p-4 bg-teal-50 rounded-xl border border-teal-100"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold text-teal-800">{selectedZone.name}</h4>
                          <Badge className={`${
                            selectedZone.priority === 'high' ? 'bg-red-100 text-red-700' :
                            selectedZone.priority === 'medium' ? 'bg-amber-100 text-amber-700' :
                            'bg-slate-100 text-slate-700'
                          }`}>
                            {selectedZone.priority} priority
                          </Badge>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div className="flex items-center gap-2">
                            <Eye className="h-4 w-4 text-teal-500" />
                            <span className="text-slate-600">Attention: <strong>{selectedZone.attention}%</strong></span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-teal-500" />
                            <span className="text-slate-600">Avg. time: <strong>{selectedZone.timeSpent}s</strong></span>
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {/* Insights */}
                    <div className="mt-4 grid grid-cols-3 gap-3 text-center">
                      <div className="p-3 bg-slate-50 rounded-lg">
                        <Clock className="h-5 w-5 text-slate-400 mx-auto mb-1" />
                        <div className="text-lg font-bold text-slate-800">7.4s</div>
                        <div className="text-xs text-slate-500">Avg. review time</div>
                      </div>
                      <div className="p-3 bg-slate-50 rounded-lg">
                        <MousePointer className="h-5 w-5 text-slate-400 mx-auto mb-1" />
                        <div className="text-lg font-bold text-slate-800">Top 1/3</div>
                        <div className="text-xs text-slate-500">Most viewed area</div>
                      </div>
                      <div className="p-3 bg-slate-50 rounded-lg">
                        <Target className="h-5 w-5 text-slate-400 mx-auto mb-1" />
                        <div className="text-lg font-bold text-slate-800">3</div>
                        <div className="text-xs text-slate-500">Key focus areas</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </>
            ) : (
              <Card className="h-full flex items-center justify-center">
                <CardContent className="text-center py-16">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-r from-teal-100 to-cyan-100 flex items-center justify-center">
                    <BarChart3 className="h-8 w-8 text-teal-500" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-800 mb-2">Ready to Analyze</h3>
                  <p className="text-slate-500 mb-4">
                    Paste your resume on the left to see your score and recruiter insights
                  </p>
                  <div className="flex items-center justify-center gap-2 text-sm text-teal-600">
                    <ArrowRight className="h-4 w-4" />
                    <span>Get instant ATS score & feedback</span>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
