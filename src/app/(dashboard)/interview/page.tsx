'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { 
  Mic, MicOff, Play, Pause, RotateCcw, ChevronRight, ChevronLeft,
  Sparkles, MessageSquare, ThumbsUp, ThumbsDown, Target, Trophy,
  Lightbulb, Clock, CheckCircle, AlertCircle, Loader2, Volume2, VolumeX,
  Brain, Zap, Star, Award, TrendingUp, FileText, Upload, Briefcase
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { AiLoadingOverlay } from '@/components/ai-loading-overlay'
import { canPerformAction, getUserSubscription } from '@/lib/subscription-limits'
import { UpgradeModal } from '@/components/upgrade-modal'
import { toast } from 'sonner'

interface Question {
  id: number
  question: string
  type: 'behavioral' | 'technical' | 'situational'
  difficulty: 'easy' | 'medium' | 'hard'
  tips: string[]
}

type InterviewRound = 'managerial' | 'technical_round_1' | 'technical_round_2' | 'hr'
type InterviewLevel = 'easy' | 'medium' | 'hard' | 'god'

interface Answer {
  questionId: number
  answer: string
  duration: number
  feedback?: {
    score: number
    strengths: string[]
    improvements: string[]
    sampleAnswer: string
  }
}

const computeAverageScore = (allAnswers: Answer[]) => {
  if (!allAnswers || allAnswers.length === 0) return 0
  return Math.round(allAnswers.reduce((sum, a) => sum + (a.feedback?.score || 0), 0) / allAnswers.length)
}

interface Resume {
  id: string
  title: string
  content: any
  isCustomized?: boolean
  linkedJDId?: string
}

interface JobDescription {
  id: string
  title: string
  company: string
  description: string
  requirements: string[] | null
  extracted_keywords: string[] | null
  linkedResumeId?: string
}

// Speech Recognition types
interface SpeechRecognitionEvent {
  results: SpeechRecognitionResultList
  resultIndex: number
}

interface SpeechRecognitionResultList {
  length: number
  item(index: number): SpeechRecognitionResult
  [index: number]: SpeechRecognitionResult
}

interface SpeechRecognitionResult {
  isFinal: boolean
  length: number
  item(index: number): SpeechRecognitionAlternative
  [index: number]: SpeechRecognitionAlternative
}

interface SpeechRecognitionAlternative {
  transcript: string
  confidence: number
}

declare global {
  interface Window {
    SpeechRecognition: any
    webkitSpeechRecognition: any
  }
}

// Generate questions based on JD and resume
const generateQuestionsFromContext = (
  jobTitle: string, 
  jobDescription: string, 
  skills: string[],
  resumeData: any | undefined,
  interviewRound: InterviewRound,
  interviewLevel: InterviewLevel
): Question[] => {
  const questions: Question[] = []
  
  // Extract key requirements from JD
  const jdLower = jobDescription.toLowerCase()
  const hasLeadership = jdLower.includes('lead') || jdLower.includes('manage') || jdLower.includes('team')
  const hasCollaboration = jdLower.includes('collaborat') || jdLower.includes('cross-functional')
  const hasProblemSolving = jdLower.includes('problem') || jdLower.includes('solution')
  const hasInnovation = jdLower.includes('innovat') || jdLower.includes('creative')
  
  // Behavioral questions based on JD
  if (hasLeadership) {
    questions.push({
      id: questions.length + 1,
      question: "Tell me about a time when you led a team through a challenging project. What was your approach and what was the outcome?",
      type: 'behavioral',
      difficulty: 'medium',
      tips: getTipsForType('behavioral')
    })
  }
  
  if (hasCollaboration) {
    questions.push({
      id: questions.length + 1,
      question: "Describe a situation where you had to collaborate with multiple teams or stakeholders. How did you ensure effective communication?",
      type: 'behavioral',
      difficulty: 'medium',
      tips: getTipsForType('behavioral')
    })
  }
  
  if (hasProblemSolving) {
    questions.push({
      id: questions.length + 1,
      question: "Walk me through a complex problem you solved. What was your approach and how did you arrive at the solution?",
      type: 'technical',
      difficulty: 'hard',
      tips: getTipsForType('technical')
    })
  }
  
  // Technical questions based on skills
  skills.slice(0, 3).forEach((skill, index) => {
    questions.push({
      id: questions.length + 1,
      question: `Can you tell me about your experience with ${skill}? Describe a project where you used it effectively.`,
      type: 'technical',
      difficulty: index === 0 ? 'easy' : 'medium',
      tips: getTipsForType('technical')
    })
  })
  
  // Resume-based questions
  if (resumeData?.experience && resumeData.experience.length > 0) {
    const latestJob = resumeData.experience[0]
    if (latestJob?.company) {
      questions.push({
        id: questions.length + 1,
        question: `I see you worked at ${latestJob.company}. What was your biggest achievement there and how does it prepare you for this role?`,
        type: 'behavioral',
        difficulty: 'medium',
        tips: getTipsForType('behavioral')
      })
    }
  }
  
  // Standard situational questions
  questions.push({
    id: questions.length + 1,
    question: `Why are you interested in this ${jobTitle} position and what makes you a great fit?`,
    type: 'situational',
    difficulty: 'easy',
    tips: getTipsForType('situational')
  })
  
  questions.push({
    id: questions.length + 1,
    question: "Where do you see yourself in 5 years and how does this role fit into your career goals?",
    type: 'situational',
    difficulty: 'medium',
    tips: getTipsForType('situational')
  })
  
  // Add more standard questions if we don't have enough
  const standardQuestions = [
    { q: "Tell me about a time you failed and what you learned from it.", type: 'behavioral' as const, difficulty: 'hard' as const },
    { q: "How do you handle tight deadlines and pressure?", type: 'situational' as const, difficulty: 'medium' as const },
    { q: "Describe a situation where you had to learn something new quickly.", type: 'behavioral' as const, difficulty: 'easy' as const },
    { q: "How do you stay updated with the latest trends in your field?", type: 'technical' as const, difficulty: 'easy' as const },
  ]
  
  while (questions.length < 8) {
    const q = standardQuestions[questions.length % standardQuestions.length]
    questions.push({
      id: questions.length + 1,
      question: q.q,
      type: q.type,
      difficulty: q.difficulty,
      tips: getTipsForType(q.type)
    })
  }

  const baseQuestions = questions.slice(0, 8)

  const normalizedDifficulty: Question['difficulty'] =
    interviewLevel === 'easy' ? 'easy' : interviewLevel === 'medium' ? 'medium' : 'hard'

  const roundAdjusted: Question[] = baseQuestions.map((q): Question => {
    if (interviewRound === 'hr') {
      if (q.type === 'technical') {
        return { ...q, type: 'behavioral', tips: getTipsForType('behavioral') }
      }
      return q
    }

    if (interviewRound === 'managerial') {
      if (q.type === 'technical') {
        return { ...q, type: 'situational', tips: getTipsForType('situational') }
      }
      return q
    }

    if (interviewRound === 'technical_round_2') {
      if (q.type === 'behavioral') {
        return { ...q, type: 'technical', tips: getTipsForType('technical') }
      }
      return q
    }

    return q
  })

  return roundAdjusted.map((q): Question => ({ ...q, difficulty: normalizedDifficulty }))
}

const getTipsForType = (type: string): string[] => {
  switch (type) {
    case 'behavioral':
      return [
        'Use the STAR method: Situation, Task, Action, Result',
        'Be specific with examples from your experience',
        'Quantify your achievements when possible',
      ]
    case 'technical':
      return [
        'Explain your thought process clearly',
        'Mention specific tools and technologies',
        'Discuss trade-offs and alternatives you considered',
      ]
    case 'situational':
      return [
        'Show enthusiasm and genuine interest',
        'Align your answer with company values',
        'Be honest but strategic in your response',
      ]
    default:
      return []
  }
}

const generateFeedback = (question: Question, answer: string): Answer['feedback'] => {
  const wordCount = answer.split(' ').length
  const hasSpecificExample = answer.toLowerCase().includes('example') || answer.toLowerCase().includes('project') || answer.toLowerCase().includes('team')
  const hasNumbers = /\d+/.test(answer)
  const isDetailed = wordCount > 50

  let score = 50
  const strengths: string[] = []
  const improvements: string[] = []

  if (wordCount > 30) {
    score += 10
    strengths.push('Good level of detail in your response')
  } else {
    improvements.push('Try to provide more detail in your answer')
  }

  if (hasSpecificExample) {
    score += 15
    strengths.push('You included specific examples')
  } else {
    improvements.push('Include specific examples from your experience')
  }

  if (hasNumbers) {
    score += 10
    strengths.push('Great use of quantifiable metrics')
  } else {
    improvements.push('Try to quantify your achievements (e.g., "increased by 20%")')
  }

  if (isDetailed) {
    score += 15
    strengths.push('Comprehensive and well-structured answer')
  }

  // Cap score at 95
  score = Math.min(score, 95)

  const sampleAnswers: Record<string, string> = {
    behavioral: "In my previous role at [Company], I led a team of 5 developers through a critical product launch. The challenge was [specific challenge]. I took action by [specific actions], which resulted in [quantifiable outcome]. This experience taught me [key learning].",
    technical: "I have extensive experience with [technology] from my work at [Company]. For example, I built [specific project] which handled [scale/metrics]. I chose this approach because [reasoning], and it resulted in [outcome].",
    situational: "I'm excited about this role because [specific reasons]. My experience in [relevant area] aligns well with your needs. In 5 years, I see myself [growth path] while contributing to [company goals].",
  }

  return {
    score,
    strengths,
    improvements,
    sampleAnswer: sampleAnswers[question.type] || sampleAnswers.behavioral,
  }
}

export default function InterviewCoachPage() {
  const [step, setStep] = useState<'setup' | 'practice' | 'review'>('setup')
  const [jobTitle, setJobTitle] = useState('')
  const [jobDescription, setJobDescription] = useState('')
  const [interviewRound, setInterviewRound] = useState<InterviewRound>('technical_round_1')
  const [interviewLevel, setInterviewLevel] = useState<InterviewLevel>('medium')
  const [skills, setSkills] = useState<string[]>([])
  const [skillInput, setSkillInput] = useState('')
  const [questions, setQuestions] = useState<Question[]>([])
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<Answer[]>([])
  const [currentAnswer, setCurrentAnswer] = useState('')
  const [isRecording, setIsRecording] = useState(false)
  const [timer, setTimer] = useState(0)
  const [isTimerRunning, setIsTimerRunning] = useState(false)
  const [showTips, setShowTips] = useState(true)
  const [isGeneratingFeedback, setIsGeneratingFeedback] = useState(false)
  const [overallScore, setOverallScore] = useState(0)
  const [aiThreadId, setAiThreadId] = useState<string | null>(null)
  const [aiMessages, setAiMessages] = useState<any[]>([])
  const [aiMode, setAiMode] = useState(false)
  const [aiEvaluation, setAiEvaluation] = useState<any>(null)
  const [isFetchingNextQuestion, setIsFetchingNextQuestion] = useState(false)
  const [isStartingInterview, setIsStartingInterview] = useState(false)
  
  // Upgrade modal state
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)
  const [upgradeInfo, setUpgradeInfo] = useState({ current: 0, limit: 0, tier: 'free' })
  
  // Audio states
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [audioEnabled, setAudioEnabled] = useState(true)
  const [speechSupported, setSpeechSupported] = useState(false)
  const [recognitionSupported, setRecognitionSupported] = useState(false)
  const [interimTranscript, setInterimTranscript] = useState('')
  
  // Resume states
  const [resumes, setResumes] = useState<Resume[]>([])
  const [selectedResumeId, setSelectedResumeId] = useState<string>('')
  const [selectedResumeData, setSelectedResumeData] = useState<any>(null)
  const [loadingResumes, setLoadingResumes] = useState(true)
  
  // Job Description states
  const [savedJDs, setSavedJDs] = useState<JobDescription[]>([])
  const [selectedJDId, setSelectedJDId] = useState<string>('')
  const [loadingJDs, setLoadingJDs] = useState(true)
  const [inputMode, setInputMode] = useState<'saved' | 'manual'>('manual') // Start with manual, switch to saved when JDs load
  
  // History states
  const [pastSessions, setPastSessions] = useState<any[]>([])
  const [loadingHistory, setLoadingHistory] = useState(true)
  const [showHistory, setShowHistory] = useState(false)
  
  // Refs
  const recognitionRef = useRef<any>(null)
  const synthRef = useRef<SpeechSynthesis | null>(null)
  const voicesLoadedRef = useRef<boolean>(false)
  const practiceSetupRef = useRef<HTMLDivElement | null>(null)

  const supabase = createClient()
  
  // Check for speech support on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setSpeechSupported('speechSynthesis' in window)
      setRecognitionSupported('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)
      synthRef.current = window.speechSynthesis
      
      // Preload voices
      const loadVoices = () => {
        if (synthRef.current) {
          synthRef.current.getVoices()
          voicesLoadedRef.current = true
        }
      }
      loadVoices()
      if (synthRef.current) {
        synthRef.current.onvoiceschanged = loadVoices
      }
    }
  }, [])
  
  // Load user's resumes, job descriptions, and history
  useEffect(() => {
    const loadData = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setLoadingResumes(false)
        setLoadingJDs(false)
        setLoadingHistory(false)
        return
      }
      
      // Load resumes, JDs, customized resumes (for JDs), and history in parallel
      const [resumesResult, jdsResult, customizedResult, historyResult] = await Promise.all([
        (supabase as any)
          .from('resumes')
          .select('id, title, contact, summary, experience, education, skills')
          .eq('user_id', user.id)
          .order('updated_at', { ascending: false }),
        (supabase as any)
          .from('job_descriptions')
          .select('id, title, company, description, requirements, extracted_keywords')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false }),
        (supabase as any)
          .from('customized_resumes')
          .select('id, title, ai_suggestions, customized_content, source_resume_id, job_description_id, cover_letter, match_score, created_at, updated_at')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false }),
        (supabase as any)
          .from('interview_sessions')
          .select('id, job_title, job_description, overall_score, status, created_at, questions, answers, interview_round, interview_level')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(10)
      ])

      if (resumesResult.error) {
        console.error('Interview Prep - resumes load error:', resumesResult.error)
      }
      if (customizedResult.error) {
        console.error('Interview Prep - customized resumes load error:', customizedResult.error)
      }
      if (jdsResult.error) {
        console.error('Interview Prep - job descriptions load error:', jdsResult.error)
      }
      
      // Combine base resumes and customized resumes
      const allResumes: Resume[] = []
      
      if (resumesResult.data) {
        resumesResult.data.forEach((r: any) => {
          allResumes.push({
            id: r.id,
            title: r.title || 'Untitled Resume',
            content: {
              contact: r.contact,
              summary: r.summary,
              experience: r.experience,
              education: r.education,
              skills: r.skills,
            },
            isCustomized: false,
          })
        })
      }
      
      // Combine JDs from job_descriptions table and customized_resumes
      const allJDs: JobDescription[] = []
      
      if (jdsResult.data) {
        allJDs.push(...jdsResult.data)
      }
      
      // Extract JDs and resumes from customized resumes
      if (customizedResult.data) {
        customizedResult.data.forEach((cr: any) => {
          // Extract job title from the customized resume title (format: "Resume - JobTitle")
          const titleParts = cr.title?.split(' - ') || []
          const jobTitle = titleParts.length > 1 ? titleParts[1] : 'Job Position'
          const jdId = `cr_${cr.id}`
          
          // Get resume content from customized_content
          const resumeContent = cr.customized_content || {}
          
          // Add customized resume as a resume option
          allResumes.push({
            id: `cr_${cr.id}`,
            title: `${cr.title || 'Customized Resume'} (Customized)`,
            content: resumeContent,
            isCustomized: true,
            linkedJDId: jdId,
          })
          
          // Get keywords - handle both array and string formats
          let keywords: string[] = []
          if (cr.ai_suggestions?.keywords_added) {
            if (Array.isArray(cr.ai_suggestions.keywords_added)) {
              keywords = cr.ai_suggestions.keywords_added
            } else if (typeof cr.ai_suggestions.keywords_added === 'string') {
              try {
                keywords = JSON.parse(cr.ai_suggestions.keywords_added)
              } catch {
                keywords = [cr.ai_suggestions.keywords_added]
              }
            }
          }
          
          // Add JD from customized resume
          const jdText = cr.ai_suggestions?.job_description || ''
          const isUrl = jdText.startsWith('http://') || jdText.startsWith('https://')
          
          // Create description - use actual JD text if available, otherwise create from title/keywords
          const description = isUrl || jdText.length < 50
            ? `Position: ${jobTitle}\n\nKey Skills & Requirements:\n${keywords.map(k => `• ${k}`).join('\n')}`
            : jdText
          
          allJDs.push({
            id: jdId,
            title: jobTitle,
            company: '',
            description: description,
            requirements: null,
            extracted_keywords: keywords,
            linkedResumeId: `cr_${cr.id}`,
          })
        })
      }
      
      console.log('Interview Prep - Data loaded:', {
        resumesCount: allResumes.length,
        jdsCount: allJDs.length,
        customizedCount: customizedResult.data?.length || 0,
        allJDs: allJDs.map(j => ({ id: j.id, title: j.title })),
      })
      
      setResumes(allResumes)
      setSavedJDs(allJDs)
      // If user has saved JDs, default to saved mode; otherwise manual
      if (allJDs.length === 0) {
        setInputMode('manual')
      } else {
        setInputMode('saved')
      }
      
      if (historyResult.data) {
        setPastSessions(historyResult.data)
      }
      setLoadingResumes(false)
      setLoadingJDs(false)
      setLoadingHistory(false)
    }
    
    loadData()
  }, [supabase])
  
  // Load selected resume data
  useEffect(() => {
    if (selectedResumeId) {
      const resume = resumes.find(r => r.id === selectedResumeId)
      if (resume) {
        setSelectedResumeData(resume.content)
        // Auto-populate skills from resume
        if (resume.content?.skills) {
          const resumeSkills = resume.content.skills
            .slice(0, 5)
            .map((s: any) => typeof s === 'string' ? s : s.name || s.skill)
            .filter(Boolean)
          setSkills(prev => [...new Set([...prev, ...resumeSkills])])
        }
      }
    }
  }, [selectedResumeId, resumes])
  
  // Auto-fill when JD is selected
  useEffect(() => {
    if (selectedJDId) {
      const jd = savedJDs.find(j => j.id === selectedJDId)
      if (jd) {
        setJobTitle(jd.title || '')
        setJobDescription(jd.description || '')
        // Auto-populate skills from JD keywords
        if (jd.extracted_keywords && jd.extracted_keywords.length > 0) {
          setSkills(prev => [...new Set([...prev, ...jd.extracted_keywords!.slice(0, 5)])])
        }
        // Auto-select the linked customized resume if available
        if (jd.linkedResumeId) {
          setSelectedResumeId(jd.linkedResumeId)
        }
      }
    }
  }, [selectedJDId, savedJDs, inputMode])

  const applyQuickStartJD = useCallback((jd: JobDescription) => {
    setSelectedJDId(jd.id)
    setInputMode('saved')
    setJobTitle(jd.title || '')
    setJobDescription(jd.description || '')
    if (jd.linkedResumeId) {
      setSelectedResumeId(jd.linkedResumeId)
    }
    if (jd.extracted_keywords) {
      setSkills(jd.extracted_keywords.slice(0, 5))
    }
  }, [])
  
  // Text-to-Speech function using browser Web Speech API (FREE)
  const speakText = useCallback((text: string, onComplete?: () => void) => {
    if (!speechSupported || !audioEnabled || !synthRef.current) {
      onComplete?.()
      return
    }
    
    // Cancel any ongoing speech
    synthRef.current.cancel()
    
    // Add small delay after cancel to prevent cutting off initial words
    setTimeout(() => {
      if (!synthRef.current) return
      
      const utterance = new SpeechSynthesisUtterance(text)
      // Optimized settings for natural, calm speech
      utterance.rate = 0.9  // Slightly slower for clarity
      utterance.pitch = 1.0
      utterance.volume = 1.0
      
      // Select the best available voice
      const voices = synthRef.current.getVoices()
    
    // Priority order for interview-style voices
    const preferredVoiceNames = [
      'Google UK English Female',
      'Samantha',           // macOS
      'Daniel',             // macOS British
      'Alex',               // macOS
      'Karen',              // macOS Australian
      'Google US English',
      'Microsoft Zira',     // Windows
      'Microsoft David',    // Windows
    ]
    
    let selectedVoice = null
    for (const name of preferredVoiceNames) {
      selectedVoice = voices.find(v => v.name.includes(name))
      if (selectedVoice) break
    }
    
    // Fallback to any English voice
    if (!selectedVoice) {
      selectedVoice = voices.find(v => v.lang.startsWith('en-US')) || 
                      voices.find(v => v.lang.startsWith('en'))
    }
    
    if (selectedVoice) {
      utterance.voice = selectedVoice
    }
    
    utterance.onstart = () => setIsSpeaking(true)
    utterance.onend = () => {
      setIsSpeaking(false)
      onComplete?.()
    }
    utterance.onerror = () => {
      setIsSpeaking(false)
      onComplete?.()
    }
    
      synthRef.current.speak(utterance)
    }, 100)
  }, [speechSupported, audioEnabled])
  
  // Stop speaking
  const stopSpeaking = useCallback(() => {
    if (synthRef.current) {
      synthRef.current.cancel()
      setIsSpeaking(false)
    }
  }, [])
  
  // Speech-to-Text functions
  const startRecording = useCallback(() => {
    if (!recognitionSupported) return
    
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    recognitionRef.current = new SpeechRecognition()
    
    recognitionRef.current.continuous = true
    recognitionRef.current.interimResults = true
    recognitionRef.current.lang = 'en-US'
    
    recognitionRef.current.onresult = (event: SpeechRecognitionEvent) => {
      let interim = ''
      let final = ''
      
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript
        if (event.results[i].isFinal) {
          final += transcript + ' '
        } else {
          interim += transcript
        }
      }
      
      if (final) {
        setCurrentAnswer(prev => prev + final)
      }
      setInterimTranscript(interim)
    }
    
    recognitionRef.current.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error)
      setIsRecording(false)
    }
    
    recognitionRef.current.onend = () => {
      // Restart if still recording
      if (isRecording && recognitionRef.current) {
        recognitionRef.current.start()
      }
    }
    
    recognitionRef.current.start()
    setIsRecording(true)
  }, [recognitionSupported, isRecording])
  
  const stopRecording = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop()
      recognitionRef.current = null
    }
    setIsRecording(false)
    setInterimTranscript('')
  }, [])

  // Save interview session to database
  const saveSession = useCallback(async (allAnswers: Answer[], score: number) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      
      const totalDuration = allAnswers.reduce((sum, a) => sum + a.duration, 0)
      
      await (supabase as any).from('interview_sessions').insert({
        user_id: user.id,
        resume_id: selectedResumeId || null,
        job_title: jobTitle,
        job_description: jobDescription,
        interview_round: interviewRound,
        interview_level: interviewLevel,
        questions: questions,
        answers: allAnswers,
        feedback: allAnswers.map(a => a.feedback),
        overall_score: score,
        status: 'completed'
      })
    } catch (error) {
      console.error('Error saving interview session:', error)
    }
  }, [supabase, selectedResumeId, jobTitle, jobDescription, interviewRound, interviewLevel, questions])

  const endInterviewEarly = useCallback(async () => {
    stopRecording()
    stopSpeaking()
    setIsTimerRunning(false)
    setIsFetchingNextQuestion(true)

    try {
      if (aiMode && aiThreadId) {
        const endResp = await fetch('/api/interview', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'end',
            threadId: aiThreadId,
            messages: aiMessages,
            interviewContext: {
              jobTitle,
              jobDescription,
              interviewRound,
              interviewLevel,
            },
          }),
        })

        if (endResp.ok) {
          const evaluation = await endResp.json()
          setAiEvaluation(evaluation)
        }
      }
    } catch (e) {
      console.error('End interview error:', e)
    } finally {
      const avgScore = computeAverageScore(answers)
      setOverallScore(avgScore)
      saveSession(answers, avgScore)
      setIsFetchingNextQuestion(false)
      setStep('review')
    }
  }, [aiMode, aiThreadId, aiMessages, jobTitle, jobDescription, interviewRound, interviewLevel, stopRecording, stopSpeaking, answers, saveSession])

  // Cleanup mic and speech on unmount or navigation
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop()
        recognitionRef.current = null
      }
      if (synthRef.current) {
        synthRef.current.cancel()
      }
      setIsRecording(false)
      setIsSpeaking(false)
    }
  }, [])

  // Timer effect with trial limit enforcement
  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isTimerRunning) {
      interval = setInterval(() => {
        setTimer(t => {
          const newTime = t + 1
          // Check if user is in trial and enforce 5-minute limit (300 seconds)
          if (newTime >= 300) {
            // Get trial status from local check
            getUserSubscription().then(sub => {
              if (sub?.isTrialActive) {
                // Trial user hit 5-minute limit
                stopRecording()
                setIsTimerRunning(false)
                toast.error('Trial interview limit reached (5 minutes). Complete payment to unlock unlimited interview prep!', {
                  duration: 5000,
                })
                // Show upgrade modal
                setUpgradeInfo({ 
                  current: 1, 
                  limit: 1, 
                  tier: sub.tier 
                })
                setShowUpgradeModal(true)
              }
            })
          }
          return newTime
        })
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [isTimerRunning, stopRecording])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const addSkill = () => {
    if (skillInput.trim() && !skills.includes(skillInput.trim())) {
      setSkills([...skills, skillInput.trim()])
      setSkillInput('')
    }
  }

  const removeSkill = (skill: string) => {
    setSkills(skills.filter(s => s !== skill))
  }

  const startPractice = async () => {
    // Check subscription limits first
    const limitCheck = await canPerformAction('interviews')
    if (!limitCheck.allowed) {
      setUpgradeInfo({ 
        current: limitCheck.current, 
        limit: limitCheck.limit, 
        tier: limitCheck.tier 
      })
      setShowUpgradeModal(true)
      return
    }

    setIsStartingInterview(true)
    setAiEvaluation(null)
    setAiMode(false)
    setAiThreadId(null)
    setAiMessages([])

    try {
      const response = await fetch('/api/interview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'start',
          jobTitle,
          jobDescription,
          resumeData: selectedResumeData,
          interviewRound,
          interviewLevel,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to start interview')
      }

      const data = await response.json()

      const q: Question = {
        id: data.questionNumber || 1,
        question: data.question || "Let's begin. Tell me about yourself.",
        type: (data.questionType === 'technical' || data.questionType === 'situational' || data.questionType === 'behavioral') ? data.questionType : 'behavioral',
        difficulty: interviewLevel === 'easy' ? 'easy' : interviewLevel === 'medium' ? 'medium' : 'hard',
        tips: getTipsForType((data.questionType === 'technical' || data.questionType === 'situational' || data.questionType === 'behavioral') ? data.questionType : 'behavioral'),
      }

      setAiMode(true)
      setAiThreadId(data.threadId)
      setAiMessages(data.messages || [])
      setQuestions([q])
      setStep('practice')
      setCurrentQuestion(0)
      setAnswers([])
      setCurrentAnswer('')
      setTimer(0)
      setIsTimerRunning(true)

      setIsStartingInterview(false)
      setTimeout(() => {
        speakText(q.question, () => {
          if (recognitionSupported) {
            setTimeout(() => startRecording(), 800)
          }
        })
      }, 300)
      return
    } catch (error) {
      console.error('Interview start error (fallback to local):', error)
      setIsStartingInterview(false)
    }

    const generatedQuestions = generateQuestionsFromContext(jobTitle, jobDescription, skills, selectedResumeData, interviewRound, interviewLevel)
    setQuestions(generatedQuestions)
    setStep('practice')
    setCurrentQuestion(0)
    setAnswers([])
    setTimer(0)
    setIsTimerRunning(true)
    setIsStartingInterview(false)

    const introText = "Let's begin your interview practice. Take your time to think before answering."
    setTimeout(() => {
      speakText(introText, () => {
        setTimeout(() => {
          if (generatedQuestions.length > 0) {
            speakText(generatedQuestions[0].question, () => {
              if (recognitionSupported) {
                setTimeout(() => startRecording(), 800)
              }
            })
          }
        }, 500)
      })
    }, 300)
  }

  const submitAnswer = async () => {
    setIsGeneratingFeedback(true)
    setIsTimerRunning(false)
    stopRecording()

    let feedback: Answer['feedback']
    
    try {
      // Get session for auth
      const { data: { session } } = await supabase.auth.getSession()
      
      // Call OpenAI grading edge function
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/grade-interview`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session?.access_token || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify({
            question: questions[currentQuestion].question,
            questionType: questions[currentQuestion].type,
            answer: currentAnswer,
            jobTitle,
            jobDescription,
            resumeContext: selectedResumeData ? JSON.stringify(selectedResumeData).substring(0, 500) : undefined,
          }),
        }
      )
      
      if (!response.ok) {
        throw new Error('Failed to grade answer')
      }
      
      const aiResponse = await response.json()
      feedback = {
        score: aiResponse.score || 70,
        strengths: aiResponse.strengths || ['You provided a response'],
        improvements: aiResponse.improvements || ['Add more specific examples'],
        sampleAnswer: aiResponse.sampleAnswer || 'Use the STAR method for behavioral questions.',
      }
    } catch (error) {
      console.error('Error grading answer:', error)
      // Fallback to local feedback generation
      feedback = generateFeedback(questions[currentQuestion], currentAnswer)
    }

    const newAnswer: Answer = {
      questionId: questions[currentQuestion].id,
      answer: currentAnswer,
      duration: timer,
      feedback,
    }

    setAnswers(prev => [...prev, newAnswer])
    setIsGeneratingFeedback(false)

    if (aiMode && aiThreadId) {
      try {
        setIsFetchingNextQuestion(true)
        const response = await fetch('/api/interview', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'respond',
            threadId: aiThreadId,
            message: currentAnswer,
            messages: aiMessages,
            interviewContext: {
              questionNumber: questions[currentQuestion]?.id || currentQuestion + 1,
              jobTitle,
              jobDescription,
              interviewRound,
              interviewLevel,
            },
          }),
        })

        if (!response.ok) {
          throw new Error('Failed to get next question')
        }

        const data = await response.json()
        setAiMessages(data.messages || [])

        if (data.isComplete) {
          const allAnswers = [...answers, newAnswer]
          const avgScore = computeAverageScore(allAnswers)

          try {
            const endResp = await fetch('/api/interview', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                action: 'end',
                threadId: aiThreadId,
                messages: data.messages || aiMessages,
                interviewContext: {
                  jobTitle,
                  jobDescription,
                  interviewRound,
                  interviewLevel,
                },
              }),
            })

            if (endResp.ok) {
              const evaluation = await endResp.json()
              setAiEvaluation(evaluation)
            }
          } catch (e) {
            console.error('Interview end error:', e)
          }

          setOverallScore(avgScore)
          setStep('review')
          saveSession(allAnswers, avgScore)
          setIsFetchingNextQuestion(false)
          return
        }

        // Extract question text, handling JSON markdown blocks
        let questionText = data.question || 'Please continue.'
        
        // Check if response is wrapped in markdown code block
        if (typeof questionText === 'string' && questionText.includes('```json')) {
          try {
            // Extract JSON from markdown code block
            const jsonMatch = questionText.match(/```json\s*(\{[\s\S]*?\})\s*```/)
            if (jsonMatch) {
              const parsed = JSON.parse(jsonMatch[1])
              questionText = parsed.question || questionText
            }
          } catch (e) {
            // If parsing fails, try to extract question directly
            const questionMatch = questionText.match(/"question":\s*"([^"]+)"/)
            if (questionMatch) {
              questionText = questionMatch[1]
            }
          }
        }
        
        const nextQuestion: Question = {
          id: data.questionNumber || (questions[currentQuestion]?.id || currentQuestion + 1) + 1,
          question: questionText,
          type: (data.questionType === 'technical' || data.questionType === 'situational' || data.questionType === 'behavioral') ? data.questionType : 'behavioral',
          difficulty: interviewLevel === 'easy' ? 'easy' : interviewLevel === 'medium' ? 'medium' : 'hard',
          tips: getTipsForType((data.questionType === 'technical' || data.questionType === 'situational' || data.questionType === 'behavioral') ? data.questionType : 'behavioral'),
        }

        setQuestions(prev => [...prev, nextQuestion])
        const nextQIndex = currentQuestion + 1
        setCurrentQuestion(nextQIndex)
        setCurrentAnswer('')
        setTimer(0)
        setIsTimerRunning(true)
        setIsFetchingNextQuestion(false)

        setTimeout(() => {
          speakText(nextQuestion.question, () => {
            if (recognitionSupported) {
              setTimeout(() => startRecording(), 800)
            }
          })
        }, 500)
        return
      } catch (error) {
        console.error('Interview respond error (fallback flow):', error)
        setIsFetchingNextQuestion(false)
      }
    }

    if (currentQuestion < questions.length - 1) {
      const nextQ = currentQuestion + 1
      setCurrentQuestion(nextQ)
      setCurrentAnswer('')
      setTimer(0)
      setIsTimerRunning(true)

      setTimeout(() => {
        speakText(questions[nextQ].question, () => {
          if (recognitionSupported) {
            setTimeout(() => startRecording(), 800)
          }
        })
      }, 500)
    } else {
      const allAnswers = [...answers, newAnswer]
      const avgScore = computeAverageScore(allAnswers)
      setOverallScore(avgScore)
      setStep('review')
      saveSession(allAnswers, avgScore)
    }
  }

  const skipQuestion = () => {
    const newAnswer: Answer = {
      questionId: questions[currentQuestion].id,
      answer: '',
      duration: 0,
      feedback: { score: 0, strengths: [], improvements: ['Question was skipped'], sampleAnswer: '' },
    }
    setAnswers([...answers, newAnswer])

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1)
      setCurrentAnswer('')
      setTimer(0)
    } else {
      const allAnswers = [...answers, newAnswer]
      const avgScore = computeAverageScore(allAnswers)
      setOverallScore(avgScore)
      setStep('review')
      
      // Save session to database
      saveSession(allAnswers, avgScore)
    }
  }

  const restartPractice = () => {
    setStep('setup')
    setQuestions([])
    setAnswers([])
    setCurrentQuestion(0)
    setCurrentAnswer('')
    setTimer(0)
    setOverallScore(0)
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-emerald-500'
    if (score >= 60) return 'text-amber-500'
    return 'text-red-500'
  }

  const getScoreLabel = (score: number) => {
    if (score >= 90) return 'Excellent!'
    if (score >= 80) return 'Great Job!'
    if (score >= 70) return 'Good'
    if (score >= 60) return 'Needs Improvement'
    return 'Keep Practicing'
  }

  return (
    <>
      {isStartingInterview && <AiLoadingOverlay />}
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-violet-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-violet-500 to-purple-500 flex items-center justify-center">
              <Brain className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-800">AI Interview Coach</h1>
              <p className="text-slate-500">Practice interviews and get instant AI feedback</p>
            </div>
          </div>
        </motion.div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center gap-4 mb-8">
          {['Setup', 'Practice', 'Review'].map((s, i) => (
            <div key={s} className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                (step === 'setup' && i === 0) || (step === 'practice' && i === 1) || (step === 'review' && i === 2)
                  ? 'bg-violet-500 text-white'
                  : i < ['setup', 'practice', 'review'].indexOf(step)
                  ? 'bg-emerald-500 text-white'
                  : 'bg-slate-200 text-slate-500'
              }`}>
                {i < ['setup', 'practice', 'review'].indexOf(step) ? <CheckCircle className="h-4 w-4" /> : i + 1}
              </div>
              <span className={`ml-2 text-sm ${
                (step === 'setup' && i === 0) || (step === 'practice' && i === 1) || (step === 'review' && i === 2)
                  ? 'text-violet-600 font-medium'
                  : 'text-slate-500'
              }`}>{s}</span>
              {i < 2 && <ChevronRight className="h-4 w-4 text-slate-300 mx-4" />}
            </div>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {/* Setup Step */}
          {step === 'setup' && (
            <motion.div
              key="setup"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-6"
            >
              {/* Past Sessions History */}
              {pastSessions.length > 0 && (
                <Card>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <Clock className="h-5 w-5 text-violet-500" />
                        Practice History
                      </CardTitle>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowHistory(!showHistory)}
                      >
                        {showHistory ? 'Hide' : 'Show'} ({pastSessions.length})
                      </Button>
                    </div>
                  </CardHeader>
                  {showHistory && (
                    <CardContent className="pt-0">
                      <div className="space-y-3">
                        {pastSessions.map((session) => (
                          <div
                            key={session.id}
                            className="group flex items-center justify-between p-4 bg-slate-50 rounded-lg hover:bg-violet-50 hover:border-violet-300 border border-transparent transition-all cursor-pointer"
                            onClick={() => {
                              setStep('review')
                              setJobTitle(session.job_title || '')
                              setJobDescription(session.job_description || '')
                              setInterviewRound((session.interview_round as InterviewRound) || 'technical_round_1')
                              setInterviewLevel((session.interview_level as InterviewLevel) || 'medium')
                              setQuestions(session.questions || [])
                              setAnswers(session.answers || [])
                              setOverallScore(computeAverageScore(session.answers || []) || session.overall_score || 0)
                            }}
                          >
                            <div className="flex items-center gap-3 flex-1">
                              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                                session.overall_score >= 70 ? 'bg-emerald-100 group-hover:bg-emerald-200' :
                                session.overall_score >= 50 ? 'bg-amber-100 group-hover:bg-amber-200' : 'bg-red-100 group-hover:bg-red-200'
                              } transition-colors`}>
                                <span className={`font-bold text-sm ${
                                  session.overall_score >= 70 ? 'text-emerald-600' :
                                  session.overall_score >= 50 ? 'text-amber-600' : 'text-red-600'
                                }`}>
                                  {session.overall_score}
                                </span>
                              </div>
                              <div className="flex-1">
                                <p className="font-medium text-slate-800 group-hover:text-violet-700 transition-colors">{session.job_title}</p>
                                <p className="text-xs text-slate-500">
                                  {new Date(session.created_at).toLocaleDateString()} • {session.questions?.length || 0} questions
                                </p>
                              </div>
                            </div>
                            <Badge className={`${
                              session.overall_score >= 70 ? 'bg-emerald-100 text-emerald-700' :
                              session.overall_score >= 50 ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'
                            }`}>
                              {session.overall_score >= 70 ? 'Strong' : session.overall_score >= 50 ? 'Good' : 'Needs Work'}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  )}
                </Card>
              )}

              {/* Quick Start from Previous Customizations */}
              {savedJDs.length > 0 && !loadingJDs && (
                <Card className="border-violet-200 bg-gradient-to-br from-violet-50 to-purple-50">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Sparkles className="h-5 w-5 text-violet-500" />
                      Quick Start from Previous Roles
                    </CardTitle>
                    <CardDescription>
                      Practice for roles you&apos;ve already customized your resume for
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-2">
                      {savedJDs.slice(0, 3).map((jd) => (
                        <button
                          key={jd.id}
                          onClick={() => {
                            applyQuickStartJD(jd)
                            practiceSetupRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
                          }}
                          className={`flex items-center justify-between p-3 bg-white rounded-lg border hover:shadow-sm transition-all text-left group ${
                            selectedJDId === jd.id ? 'border-violet-400 ring-2 ring-violet-200' : 'border-violet-100 hover:border-violet-300'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-violet-100 flex items-center justify-center">
                              <Briefcase className="h-5 w-5 text-violet-600" />
                            </div>
                            <div>
                              <p className="font-medium text-slate-800">{jd.title || 'Job Position'}</p>
                              <p className="text-xs text-slate-500">
                                {jd.extracted_keywords?.slice(0, 3).join(', ') || 'Click to start'}
                              </p>
                            </div>
                          </div>
                          <ChevronRight className="h-5 w-5 text-slate-400 group-hover:text-violet-500 transition-colors" />
                        </button>
                      ))}
                    </div>
                    {savedJDs.length > 3 && (
                      <p className="text-xs text-slate-500 mt-3 text-center">
                        +{savedJDs.length - 3} more roles available
                      </p>
                    )}
                  </CardContent>
                </Card>
              )}

              <Card>
                <div ref={practiceSetupRef} />
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5 text-violet-500" />
                    {savedJDs.length > 0 ? 'Or Start a New Practice Session' : 'Set Up Your Practice Session'}
                  </CardTitle>
                  <CardDescription>
                    Tell us about the role you&apos;re interviewing for to get personalized questions
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Step 1: Job Description Source */}
                  <div className="space-y-4">
                    <Label className="flex items-center gap-2 text-base font-semibold">
                      <Target className="h-4 w-4 text-violet-500" />
                      Step 1: Job Description
                    </Label>

                    {loadingJDs ? (
                      <div className="flex items-center gap-2 text-sm text-slate-500 p-4 bg-slate-50 rounded-lg">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Loading your job descriptions...
                      </div>
                    ) : inputMode === 'saved' && savedJDs.length > 0 ? (
                      <div className="space-y-3">
                        <Select value={selectedJDId} onValueChange={setSelectedJDId}>
                          <SelectTrigger className="bg-white">
                            <SelectValue placeholder="Select a saved job description" />
                          </SelectTrigger>
                          <SelectContent>
                            {savedJDs.map((jd) => (
                              <SelectItem key={jd.id} value={jd.id}>
                                <div className="flex flex-col">
                                  <span className="font-medium">{jd.title || 'Untitled'}</span>
                                  <span className="text-xs text-slate-500">{jd.company || 'No company'}</span>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {selectedJDId && (
                          <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3">
                            <div className="flex items-center gap-2 text-emerald-700 text-sm">
                              <CheckCircle className="h-4 w-4" />
                              <span>Job description loaded! Title and skills auto-filled.</span>
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="jobTitle">Job Title *</Label>
                          <Input
                            id="jobTitle"
                            placeholder="e.g., Senior Software Engineer"
                            value={jobTitle}
                            onChange={(e) => setJobTitle(e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="jobDescription">Job Description *</Label>
                          <Textarea
                            id="jobDescription"
                            placeholder="Paste the job description here for tailored interview questions..."
                            value={jobDescription}
                            onChange={(e) => setJobDescription(e.target.value)}
                            rows={5}
                          />
                          <p className="text-xs text-slate-500">
                            The AI will analyze this to generate relevant interview questions
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Divider */}
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-slate-200" />
                    </div>
                  </div>

                  {/* Step 2: Resume Selection */}
                  <div className="space-y-4">
                    <Label className="flex items-center gap-2 text-base font-semibold">
                      <FileText className="h-4 w-4 text-violet-500" />
                      Step 2: Your Resume *
                    </Label>
                    <p className="text-sm text-slate-500">
                      Select your resume for personalized interview questions
                    </p>
                    {loadingResumes ? (
                      <div className="flex items-center gap-2 text-sm text-slate-500">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Loading resumes...
                      </div>
                    ) : resumes.length > 0 ? (
                      <div className="space-y-3">
                        <Select value={selectedResumeId} onValueChange={setSelectedResumeId}>
                          <SelectTrigger>
                            <SelectValue placeholder="Choose a resume for personalized questions" />
                          </SelectTrigger>
                          <SelectContent>
                            {resumes.map((resume) => (
                              <SelectItem key={resume.id} value={resume.id}>
                                <div className="flex items-center gap-2">
                                  <span>{resume.title || 'Untitled Resume'}</span>
                                  {resume.isCustomized && (
                                    <Badge variant="secondary" className="text-xs bg-violet-100 text-violet-700">
                                      Customized
                                    </Badge>
                                  )}
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {selectedResumeId && resumes.find(r => r.id === selectedResumeId)?.isCustomized && (
                          <div className="bg-violet-50 border border-violet-200 rounded-lg p-3">
                            <div className="flex items-center gap-2 text-violet-700 text-sm">
                              <CheckCircle className="h-4 w-4" />
                              <span>Using customized resume tailored for this role</span>
                            </div>
                          </div>
                        )}
                        <div className="flex items-center gap-2 text-xs text-slate-500">
                          <span>Or</span>
                          <a href="/resumes/new" className="text-violet-600 font-medium hover:underline flex items-center gap-1">
                            <Upload className="h-3 w-3" />
                            Upload a new resume
                          </a>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 space-y-3">
                        <p className="text-sm text-amber-800">
                          No resumes found. Upload a resume to start interview practice.
                        </p>
                        <a 
                          href="/resumes/new" 
                          className="inline-flex items-center gap-2 px-4 py-2 bg-violet-600 text-white text-sm font-medium rounded-lg hover:bg-violet-700 transition-colors"
                        >
                          <Upload className="h-4 w-4" />
                          Upload Resume
                        </a>
                      </div>
                    )}
                  </div>

                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-slate-200" />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <Label className="flex items-center gap-2 text-base font-semibold">
                      <Brain className="h-4 w-4 text-violet-500" />
                      Step 3: Interview Settings
                    </Label>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Round</Label>
                        <Select value={interviewRound} onValueChange={(v) => setInterviewRound(v as InterviewRound)}>
                          <SelectTrigger className="bg-white">
                            <SelectValue placeholder="Select round" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="managerial">Managerial Round</SelectItem>
                            <SelectItem value="technical_round_1">Technical Round 1</SelectItem>
                            <SelectItem value="technical_round_2">Technical Round 2</SelectItem>
                            <SelectItem value="hr">HR Round</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label>Level</Label>
                        <Select value={interviewLevel} onValueChange={(v) => setInterviewLevel(v as InterviewLevel)}>
                          <SelectTrigger className="bg-white">
                            <SelectValue placeholder="Select level" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="easy">Easy</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="hard">Hard</SelectItem>
                            <SelectItem value="god">God Level</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>

                  {/* Step 3: Additional Skills */}
                  <div className="space-y-4">
                    <Label className="flex items-center gap-2 text-base font-semibold">
                      <Zap className="h-4 w-4 text-amber-500" />
                      Step 4: Key Skills
                    </Label>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Add a skill..."
                        value={skillInput}
                        onChange={(e) => setSkillInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && addSkill()}
                        className="flex-1"
                      />
                      <Button onClick={addSkill} variant="outline">Add</Button>
                    </div>
                    <div className="min-h-[60px] p-3 border border-slate-200 rounded-lg bg-white">
                      {skills.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {skills.map((skill) => (
                            <Badge
                              key={skill}
                              variant="secondary"
                              className="cursor-pointer hover:bg-red-100 transition-colors bg-violet-100 text-violet-700"
                              onClick={() => removeSkill(skill)}
                            >
                              {skill} ×
                            </Badge>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-slate-400">Skills will be auto-extracted from your resume and JD</p>
                      )}
                    </div>
                  </div>

                  {/* Audio Settings */}
                  <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {audioEnabled ? (
                          <Volume2 className="h-5 w-5 text-violet-500" />
                        ) : (
                          <VolumeX className="h-5 w-5 text-slate-400" />
                        )}
                        <div>
                          <h4 className="font-medium text-slate-800">Audio Mode</h4>
                          <p className="text-sm text-slate-500">
                            {speechSupported 
                              ? 'Questions will be read aloud' 
                              : 'Audio not supported in this browser'}
                          </p>
                        </div>
                      </div>
                      <Button
                        variant={audioEnabled ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setAudioEnabled(!audioEnabled)}
                        disabled={!speechSupported}
                      >
                        {audioEnabled ? 'On' : 'Off'}
                      </Button>
                    </div>
                    {recognitionSupported && (
                      <div className="mt-3 pt-3 border-t border-slate-200">
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <Mic className="h-4 w-4" />
                          <span>Voice input available - speak your answers!</span>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="bg-violet-50 rounded-xl p-4 border border-violet-100">
                    <div className="flex items-start gap-3">
                      <Lightbulb className="h-5 w-5 text-violet-500 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-violet-800">Pro Tips</h4>
                        <ul className="text-sm text-violet-600 mt-1 space-y-1">
                          <li>• Select your resume for personalized questions</li>
                          <li>• Paste the full job description for best results</li>
                          <li>• Use voice mode to practice speaking naturally</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <Button
                    onClick={startPractice}
                    disabled={!jobTitle || !jobDescription || !selectedResumeId}
                    className="w-full bg-gradient-to-r from-violet-500 to-purple-500 hover:from-violet-600 hover:to-purple-600"
                    size="lg"
                  >
                    <Play className="mr-2 h-5 w-5" />
                    Start Interview Practice
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Practice Step */}
          {step === 'practice' && questions.length > 0 && (
            <motion.div
              key="practice"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <Badge variant="outline" className="text-violet-600 border-violet-300">
                        Question {currentQuestion + 1}
                      </Badge>
                      <Badge variant="secondary">
                        {interviewRound === 'managerial'
                          ? 'Managerial'
                          : interviewRound === 'technical_round_1'
                          ? 'Technical R1'
                          : interviewRound === 'technical_round_2'
                          ? 'Technical R2'
                          : 'HR'}
                      </Badge>
                      <Badge className={`${
                        interviewLevel === 'easy' ? 'bg-emerald-100 text-emerald-700' :
                        interviewLevel === 'medium' ? 'bg-amber-100 text-amber-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {interviewLevel === 'god' ? 'god level' : interviewLevel}
                      </Badge>
                      <Badge className={`${
                        questions[currentQuestion].difficulty === 'easy' ? 'bg-emerald-100 text-emerald-700' :
                        questions[currentQuestion].difficulty === 'medium' ? 'bg-amber-100 text-amber-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {questions[currentQuestion].difficulty}
                      </Badge>
                      <Badge variant="secondary">
                        {questions[currentQuestion].type}
                      </Badge>
                      {isFetchingNextQuestion && (
                        <span className="flex items-center gap-2 text-sm text-slate-500">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Loading next question...
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-slate-600">
                      <Clock className="h-4 w-4" />
                      <span className="font-mono text-lg">{formatTime(timer)}</span>
                    </div>
                  </div>
                  <Progress value={Math.min(((currentQuestion + 1) / 10) * 100, 100)} className="mt-4" />
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Question with Audio Controls */}
                  <div className="bg-gradient-to-r from-violet-50 to-purple-50 rounded-xl p-6 border border-violet-100 relative">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3 flex-1">
                        <MessageSquare className="h-6 w-6 text-violet-500 mt-1 flex-shrink-0" />
                        <p className="text-lg text-slate-800 font-medium">
                          {questions[currentQuestion].question}
                        </p>
                      </div>
                      {speechSupported && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => isSpeaking ? stopSpeaking() : speakText(questions[currentQuestion].question)}
                          className="flex-shrink-0"
                          disabled={isFetchingNextQuestion}
                        >
                          {isSpeaking ? (
                            <VolumeX className="h-5 w-5 text-violet-500" />
                          ) : (
                            <Volume2 className="h-5 w-5 text-violet-500" />
                          )}
                        </Button>
                      )}
                    </div>
                    {isSpeaking && (
                      <div className="mt-3 flex items-center gap-2 text-sm text-violet-600">
                        <div className="flex gap-1">
                          <span className="w-1 h-4 bg-violet-400 rounded animate-pulse" />
                          <span className="w-1 h-4 bg-violet-500 rounded animate-pulse delay-75" />
                          <span className="w-1 h-4 bg-violet-400 rounded animate-pulse delay-150" />
                        </div>
                        Speaking...
                      </div>
                    )}
                  </div>

                  {/* Tips */}
                  {showTips && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="bg-amber-50 rounded-xl p-4 border border-amber-100"
                    >
                      <div className="flex items-start gap-3">
                        <Lightbulb className="h-5 w-5 text-amber-500" />
                        <div>
                          <h4 className="font-medium text-amber-800 mb-2">Tips for this question:</h4>
                          <ul className="text-sm text-amber-700 space-y-1">
                            {questions[currentQuestion].tips.map((tip, i) => (
                              <li key={i}>• {tip}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* Answer Input with Voice */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="flex items-center gap-2">
                        Your Answer
                        {isRecording && (
                          <span className="flex items-center gap-1 text-red-500 text-xs font-normal">
                            <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                            Recording...
                          </span>
                        )}
                      </Label>
                      <div className="flex items-center gap-2">
                        {recognitionSupported && (
                          <Button
                            variant={isRecording ? 'destructive' : 'outline'}
                            size="sm"
                            onClick={() => isRecording ? stopRecording() : startRecording()}
                          >
                            {isRecording ? (
                              <>
                                <MicOff className="mr-1 h-4 w-4" />
                                Stop
                              </>
                            ) : (
                              <>
                                <Mic className="mr-1 h-4 w-4" />
                                Speak
                              </>
                            )}
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setShowTips(!showTips)}
                        >
                          {showTips ? 'Hide Tips' : 'Show Tips'}
                        </Button>
                      </div>
                    </div>
                    <div className="relative">
                      <Textarea
                        placeholder={isRecording ? "Listening... speak your answer" : "Type or speak your answer... Be specific and use examples from your experience."}
                        value={currentAnswer}
                        onChange={(e) => setCurrentAnswer(e.target.value)}
                        rows={6}
                        className={`resize-none ${isRecording ? 'border-red-300 bg-red-50/50' : ''}`}
                        disabled={isFetchingNextQuestion}
                      />
                      {isRecording && (
                        <div className="absolute bottom-3 right-3 flex items-center gap-2">
                          <div className="flex gap-0.5">
                            <span className="w-1 h-3 bg-red-400 rounded animate-pulse" />
                            <span className="w-1 h-4 bg-red-500 rounded animate-pulse delay-75" />
                            <span className="w-1 h-3 bg-red-400 rounded animate-pulse delay-150" />
                            <span className="w-1 h-5 bg-red-500 rounded animate-pulse delay-200" />
                            <span className="w-1 h-3 bg-red-400 rounded animate-pulse delay-300" />
                          </div>
                        </div>
                      )}
                    </div>
                    {isRecording && (
                      <div className="flex items-center justify-center gap-3 py-4 bg-red-50 dark:bg-red-950/20 rounded-lg border border-red-200 dark:border-red-800">
                        <div className="flex items-center gap-2">
                          <Mic className="h-5 w-5 text-red-500 animate-pulse" />
                          <span className="text-sm font-medium text-red-600 dark:text-red-400">Listening</span>
                        </div>
                        <div className="flex items-end gap-1 h-8">
                          <span className="w-1 bg-red-400 rounded-full animate-pulse" style={{ height: '20%', animationDelay: '0ms' }} />
                          <span className="w-1 bg-red-500 rounded-full animate-pulse" style={{ height: '40%', animationDelay: '100ms' }} />
                          <span className="w-1 bg-red-600 rounded-full animate-pulse" style={{ height: '60%', animationDelay: '200ms' }} />
                          <span className="w-1 bg-red-500 rounded-full animate-pulse" style={{ height: '80%', animationDelay: '300ms' }} />
                          <span className="w-1 bg-red-600 rounded-full animate-pulse" style={{ height: '100%', animationDelay: '400ms' }} />
                          <span className="w-1 bg-red-500 rounded-full animate-pulse" style={{ height: '80%', animationDelay: '500ms' }} />
                          <span className="w-1 bg-red-600 rounded-full animate-pulse" style={{ height: '60%', animationDelay: '600ms' }} />
                          <span className="w-1 bg-red-500 rounded-full animate-pulse" style={{ height: '40%', animationDelay: '700ms' }} />
                          <span className="w-1 bg-red-400 rounded-full animate-pulse" style={{ height: '20%', animationDelay: '800ms' }} />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3">
                    <Button
                      variant="destructive"
                      onClick={endInterviewEarly}
                      className="flex-1"
                      disabled={isFetchingNextQuestion}
                    >
                      End Interview
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        stopRecording()
                        stopSpeaking()
                        skipQuestion()
                      }}
                      className="flex-1"
                      disabled={isFetchingNextQuestion}
                    >
                      Skip Question
                    </Button>
                    <Button
                      onClick={() => {
                        stopRecording()
                        stopSpeaking()
                        submitAnswer()
                      }}
                      disabled={!currentAnswer.trim() || isGeneratingFeedback || isFetchingNextQuestion}
                      className="flex-1 bg-gradient-to-r from-violet-500 to-purple-500 hover:from-violet-600 hover:to-purple-600"
                    >
                      {isGeneratingFeedback ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Analyzing...
                        </>
                      ) : (
                        <>
                          <ChevronRight className="mr-2 h-4 w-4" />
                          Next Question
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Review Step - Detailed Performance Dashboard */}
          {step === 'review' && (
            <motion.div
              key="review"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              {/* Hero Score Card */}
              <Card className="overflow-hidden">
                <div className="bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 p-8 text-white relative overflow-hidden">
                  <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRjMC0yIDItNCAyLTRzLTItMi00LTItNC0yLTItNCAyLTQgMi00czItMiA0LTIgNC0yIDItNGMwLTItMi00LTItNHMyLTIgNC0yIDQtMiAyLTRjMC0yLTItNC0yLTRzMi0yIDQtMiA0LTIgMi00Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-20" />
                  <div className="relative flex items-center justify-between">
                    <div>
                      <h2 className="text-2xl font-bold mb-2">Interview Performance Report</h2>
                      <p className="text-violet-200">Session for: {jobTitle}</p>
                      <div className="flex items-center gap-4 mt-4">
                        <Badge className="bg-white/20 text-white border-0">
                          {questions.length} Questions
                        </Badge>
                        <Badge className="bg-white/20 text-white border-0">
                          {formatTime(answers.reduce((sum, a) => sum + a.duration, 0))} Total Time
                        </Badge>
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="w-32 h-32 rounded-full bg-white/10 backdrop-blur flex items-center justify-center border-4 border-white/30">
                        <div>
                          <div className="text-5xl font-bold">{overallScore}</div>
                          <div className="text-sm text-violet-200">Overall</div>
                        </div>
                      </div>
                      <div className="mt-2 text-lg font-medium">
                        {overallScore >= 80 ? '🌟 Excellent!' : overallScore >= 60 ? '👍 Good Progress' : '💪 Keep Practicing'}
                      </div>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Key Metrics Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-3">
                      <Trophy className="h-6 w-6 text-emerald-600" />
                    </div>
                    <div className="text-3xl font-bold text-emerald-600">
                      {answers.filter(a => (a.feedback?.score || 0) >= 70).length}
                    </div>
                    <div className="text-sm text-slate-600">Strong Answers</div>
                    <div className="text-xs text-slate-400 mt-1">Score ≥ 70</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-3">
                      <TrendingUp className="h-6 w-6 text-amber-600" />
                    </div>
                    <div className="text-3xl font-bold text-amber-600">
                      {answers.filter(a => (a.feedback?.score || 0) >= 50 && (a.feedback?.score || 0) < 70).length}
                    </div>
                    <div className="text-sm text-slate-600">Need Improvement</div>
                    <div className="text-xs text-slate-400 mt-1">Score 50-69</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-3">
                      <AlertCircle className="h-6 w-6 text-red-600" />
                    </div>
                    <div className="text-3xl font-bold text-red-600">
                      {answers.filter(a => (a.feedback?.score || 0) < 50).length}
                    </div>
                    <div className="text-sm text-slate-600">Weak/Skipped</div>
                    <div className="text-xs text-slate-400 mt-1">Score &lt; 50</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="w-12 h-12 rounded-full bg-violet-100 flex items-center justify-center mx-auto mb-3">
                      <Clock className="h-6 w-6 text-violet-600" />
                    </div>
                    <div className="text-3xl font-bold text-violet-600">
                      {answers.length > 0 ? Math.round(answers.reduce((sum, a) => sum + a.duration, 0) / answers.length) : 0}s
                    </div>
                    <div className="text-sm text-slate-600">Avg Response Time</div>
                    <div className="text-xs text-slate-400 mt-1">Per question</div>
                  </CardContent>
                </Card>
              </div>

              {/* Performance by Question Type */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5 text-violet-500" />
                    Performance by Question Type
                  </CardTitle>
                  <CardDescription>See how you performed across different question categories</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {(['behavioral', 'technical', 'situational'] as const).map((type) => {
                      const typeAnswers = answers.filter((_, i) => questions[i]?.type === type)
                      const typeScore = typeAnswers.length > 0 
                        ? Math.round(typeAnswers.reduce((sum, a) => sum + (a.feedback?.score || 0), 0) / typeAnswers.length)
                        : 0
                      const typeCount = typeAnswers.length
                      
                      return (
                        <div key={type} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <Badge variant="outline" className="capitalize">{type}</Badge>
                              <span className="text-sm text-slate-500">{typeCount} questions</span>
                            </div>
                            <span className={`font-bold ${getScoreColor(typeScore)}`}>{typeScore}%</span>
                          </div>
                          <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${typeScore}%` }}
                              transition={{ duration: 1, ease: 'easeOut' }}
                              className={`h-full rounded-full ${
                                typeScore >= 70 ? 'bg-emerald-500' :
                                typeScore >= 50 ? 'bg-amber-500' : 'bg-red-500'
                              }`}
                            />
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* Performance by Difficulty */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="h-5 w-5 text-amber-500" />
                    Performance by Difficulty Level
                  </CardTitle>
                  <CardDescription>Your scores across easy, medium, and hard questions</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4">
                    {(['easy', 'medium', 'hard'] as const).map((difficulty) => {
                      const diffAnswers = answers.filter((_, i) => questions[i]?.difficulty === difficulty)
                      const diffScore = diffAnswers.length > 0 
                        ? Math.round(diffAnswers.reduce((sum, a) => sum + (a.feedback?.score || 0), 0) / diffAnswers.length)
                        : 0
                      const diffCount = diffAnswers.length
                      
                      const colors = {
                        easy: { bg: 'bg-emerald-50', text: 'text-emerald-600', ring: 'ring-emerald-500' },
                        medium: { bg: 'bg-amber-50', text: 'text-amber-600', ring: 'ring-amber-500' },
                        hard: { bg: 'bg-red-50', text: 'text-red-600', ring: 'ring-red-500' },
                      }
                      
                      return (
                        <div key={difficulty} className={`${colors[difficulty].bg} rounded-xl p-4 text-center`}>
                          <div className="capitalize font-medium text-slate-700 mb-2">{difficulty}</div>
                          <div className={`text-3xl font-bold ${colors[difficulty].text}`}>{diffScore}%</div>
                          <div className="text-xs text-slate-500 mt-1">{diffCount} questions</div>
                          <div className="mt-3 h-2 bg-white/50 rounded-full overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${diffScore}%` }}
                              transition={{ duration: 1, delay: 0.3 }}
                              className={`h-full ${
                                difficulty === 'easy' ? 'bg-emerald-500' :
                                difficulty === 'medium' ? 'bg-amber-500' : 'bg-red-500'
                              }`}
                            />
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* Strengths & Weaknesses Analysis */}
              <div className="grid md:grid-cols-2 gap-6">
                <Card className="border-emerald-200">
                  <CardHeader className="bg-emerald-50/50">
                    <CardTitle className="flex items-center gap-2 text-emerald-700">
                      <ThumbsUp className="h-5 w-5" />
                      Your Strengths
                    </CardTitle>
                    <CardDescription>Areas where you performed well</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-4">
                    {(() => {
                      const allStrengths = answers.flatMap(a => a.feedback?.strengths || [])
                      const uniqueStrengths = [...new Set(allStrengths)]
                      return uniqueStrengths.length > 0 ? (
                        <ul className="space-y-2">
                          {uniqueStrengths.slice(0, 5).map((strength, i) => (
                            <li key={i} className="flex items-start gap-2">
                              <CheckCircle className="h-4 w-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                              <span className="text-sm text-slate-700">{strength}</span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-sm text-slate-500 text-center py-4">Complete more questions to see your strengths</p>
                      )
                    })()}
                  </CardContent>
                </Card>

                <Card className="border-amber-200">
                  <CardHeader className="bg-amber-50/50">
                    <CardTitle className="flex items-center gap-2 text-amber-700">
                      <Target className="h-5 w-5" />
                      Areas to Improve
                    </CardTitle>
                    <CardDescription>Focus on these to boost your score</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-4">
                    {(() => {
                      const allImprovements = answers.flatMap(a => a.feedback?.improvements || [])
                      const uniqueImprovements = [...new Set(allImprovements)]
                      return uniqueImprovements.length > 0 ? (
                        <ul className="space-y-2">
                          {uniqueImprovements.slice(0, 5).map((improvement, i) => (
                            <li key={i} className="flex items-start gap-2">
                              <AlertCircle className="h-4 w-4 text-amber-500 mt-0.5 flex-shrink-0" />
                              <span className="text-sm text-slate-700">{improvement}</span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-sm text-slate-500 text-center py-4">Great job! No major areas for improvement</p>
                      )
                    })()}
                  </CardContent>
                </Card>
              </div>

              {/* Score Distribution Chart */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Star className="h-5 w-5 text-yellow-500" />
                    Question-by-Question Scores
                  </CardTitle>
                  <CardDescription>Visual breakdown of your performance on each question</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {answers.map((answer, index) => (
                      <div key={index} className="flex items-center gap-4">
                        <div className="w-8 text-sm font-medium text-slate-500">Q{index + 1}</div>
                        <div className="flex-1 h-8 bg-slate-100 rounded-lg overflow-hidden relative">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${answer.feedback?.score || 0}%` }}
                            transition={{ duration: 0.8, delay: index * 0.1 }}
                            className={`h-full rounded-lg ${
                              (answer.feedback?.score || 0) >= 70 ? 'bg-gradient-to-r from-emerald-400 to-emerald-500' :
                              (answer.feedback?.score || 0) >= 50 ? 'bg-gradient-to-r from-amber-400 to-amber-500' :
                              'bg-gradient-to-r from-red-400 to-red-500'
                            }`}
                          />
                          <div className="absolute inset-0 flex items-center px-3">
                            <span className="text-xs font-medium text-white drop-shadow">
                              {questions[index]?.type}
                            </span>
                          </div>
                        </div>
                        <div className={`w-12 text-right font-bold ${getScoreColor(answer.feedback?.score || 0)}`}>
                          {answer.feedback?.score || 0}%
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Detailed Question Reviews (Collapsible) */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5 text-violet-500" />
                    Detailed Question Analysis
                  </CardTitle>
                  <CardDescription>Review each question and your response</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {answers.map((answer, index) => (
                    <details key={index} className="group border rounded-lg">
                      <summary className="flex items-center justify-between p-4 cursor-pointer hover:bg-slate-50">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            (answer.feedback?.score || 0) >= 70 ? 'bg-emerald-100' :
                            (answer.feedback?.score || 0) >= 50 ? 'bg-amber-100' : 'bg-red-100'
                          }`}>
                            <span className={`font-bold text-sm ${getScoreColor(answer.feedback?.score || 0)}`}>
                              {answer.feedback?.score || 0}
                            </span>
                          </div>
                          <div>
                            <div className="font-medium text-slate-800">Question {index + 1}</div>
                            <div className="text-sm text-slate-500 line-clamp-1">{questions[index]?.question}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">{questions[index]?.type}</Badge>
                          <Badge className={`text-xs ${
                            questions[index]?.difficulty === 'easy' ? 'bg-emerald-100 text-emerald-700' :
                            questions[index]?.difficulty === 'medium' ? 'bg-amber-100 text-amber-700' :
                            'bg-red-100 text-red-700'
                          }`}>
                            {questions[index]?.difficulty}
                          </Badge>
                          <ChevronRight className="h-4 w-4 text-slate-400 group-open:rotate-90 transition-transform" />
                        </div>
                      </summary>
                      <div className="p-4 pt-0 border-t space-y-4">
                        <div className="bg-violet-50 rounded-lg p-4">
                          <h4 className="text-sm font-medium text-violet-700 mb-2">Question:</h4>
                          <p className="text-slate-800 max-w-3xl break-words">{questions[index]?.question}</p>
                        </div>
                        
                        {answer.answer ? (
                          <>
                            <div className="bg-slate-50 rounded-lg p-4">
                              <h4 className="text-sm font-medium text-slate-600 mb-2">Your Answer:</h4>
                              <p className="text-slate-800">{answer.answer}</p>
                              <div className="mt-2 text-xs text-slate-500">
                                {answer.answer.split(' ').filter(w => w).length} words • {formatTime(answer.duration)} response time
                              </div>
                            </div>

                            <div className="grid md:grid-cols-2 gap-4">
                              {answer.feedback?.strengths && answer.feedback.strengths.length > 0 && (
                                <div className="bg-emerald-50 rounded-lg p-4">
                                  <div className="flex items-center gap-2 mb-2">
                                    <ThumbsUp className="h-4 w-4 text-emerald-500" />
                                    <h4 className="font-medium text-emerald-700">Strengths</h4>
                                  </div>
                                  <ul className="text-sm text-emerald-600 space-y-1">
                                    {answer.feedback.strengths.map((s, i) => (
                                      <li key={i}>• {s}</li>
                                    ))}
                                  </ul>
                                </div>
                              )}

                              {answer.feedback?.improvements && answer.feedback.improvements.length > 0 && (
                                <div className="bg-amber-50 rounded-lg p-4">
                                  <div className="flex items-center gap-2 mb-2">
                                    <AlertCircle className="h-4 w-4 text-amber-500" />
                                    <h4 className="font-medium text-amber-700">Areas to Improve</h4>
                                  </div>
                                  <ul className="text-sm text-amber-600 space-y-1">
                                    {answer.feedback.improvements.map((s, i) => (
                                      <li key={i}>• {s}</li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                            </div>

                            {answer.feedback?.sampleAnswer && (
                              <div className="bg-blue-50 rounded-lg p-4">
                                <div className="flex items-center gap-2 mb-2">
                                  <Sparkles className="h-4 w-4 text-blue-500" />
                                  <h4 className="font-medium text-blue-700">Sample Strong Answer</h4>
                                </div>
                                <p className="text-sm text-blue-600">{answer.feedback.sampleAnswer}</p>
                              </div>
                            )}
                          </>
                        ) : (
                          <div className="text-center py-4 text-slate-500 bg-slate-50 rounded-lg">
                            <AlertCircle className="h-8 w-8 mx-auto mb-2 text-slate-400" />
                            <p>This question was skipped</p>
                          </div>
                        )}
                      </div>
                    </details>
                  ))}
                </CardContent>
              </Card>

              {/* Recommendations */}
              <Card className="border-violet-200 bg-gradient-to-br from-violet-50 to-purple-50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-violet-800">
                    <Lightbulb className="h-5 w-5" />
                    Personalized Recommendations
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {overallScore < 60 && (
                      <div className="flex items-start gap-3 p-3 bg-white rounded-lg">
                        <div className="w-8 h-8 rounded-full bg-violet-100 flex items-center justify-center flex-shrink-0">
                          <span className="text-violet-600 font-bold">1</span>
                        </div>
                        <div>
                          <h4 className="font-medium text-slate-800">Practice the STAR Method</h4>
                          <p className="text-sm text-slate-600">Structure your answers with Situation, Task, Action, and Result for clearer responses.</p>
                        </div>
                      </div>
                    )}
                    {answers.some(a => (a.answer?.split(' ').length || 0) < 30) && (
                      <div className="flex items-start gap-3 p-3 bg-white rounded-lg">
                        <div className="w-8 h-8 rounded-full bg-violet-100 flex items-center justify-center flex-shrink-0">
                          <span className="text-violet-600 font-bold">2</span>
                        </div>
                        <div>
                          <h4 className="font-medium text-slate-800">Provide More Detail</h4>
                          <p className="text-sm text-slate-600">Some answers were brief. Aim for 50-150 words with specific examples.</p>
                        </div>
                      </div>
                    )}
                    {!answers.some(a => /\d+/.test(a.answer || '')) && (
                      <div className="flex items-start gap-3 p-3 bg-white rounded-lg">
                        <div className="w-8 h-8 rounded-full bg-violet-100 flex items-center justify-center flex-shrink-0">
                          <span className="text-violet-600 font-bold">3</span>
                        </div>
                        <div>
                          <h4 className="font-medium text-slate-800">Quantify Your Achievements</h4>
                          <p className="text-sm text-slate-600">Use numbers and metrics to make your accomplishments more impactful.</p>
                        </div>
                      </div>
                    )}
                    <div className="flex items-start gap-3 p-3 bg-white rounded-lg">
                      <div className="w-8 h-8 rounded-full bg-violet-100 flex items-center justify-center flex-shrink-0">
                        <Star className="h-4 w-4 text-violet-600" />
                      </div>
                      <div>
                        <h4 className="font-medium text-slate-800">Keep Practicing!</h4>
                        <p className="text-sm text-slate-600">Regular practice builds confidence. Try another session with different questions.</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Actions */}
              <div className="flex gap-4">
                <Button
                  variant="outline"
                  onClick={restartPractice}
                  className="flex-1"
                >
                  <RotateCcw className="mr-2 h-4 w-4" />
                  Practice Again
                </Button>
                <Button
                  className="flex-1 bg-gradient-to-r from-violet-500 to-purple-500 hover:from-violet-600 hover:to-purple-600"
                  onClick={() => window.location.href = '/dashboard'}
                >
                  <Award className="mr-2 h-4 w-4" />
                  Back to Dashboard
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>

    {/* Upgrade Modal */}
    <UpgradeModal
      open={showUpgradeModal}
      onClose={() => setShowUpgradeModal(false)}
      feature="interviews"
      current={upgradeInfo.current}
      limit={upgradeInfo.limit}
      tier={upgradeInfo.tier}
    />
    </>
  )
}
