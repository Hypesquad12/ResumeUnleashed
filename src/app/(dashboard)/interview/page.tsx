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
  Brain, Zap, Star, Award, TrendingUp, FileText, Upload
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface Question {
  id: number
  question: string
  type: 'behavioral' | 'technical' | 'situational'
  difficulty: 'easy' | 'medium' | 'hard'
  tips: string[]
}

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

interface Resume {
  id: string
  title: string
  content: any
}

interface JobDescription {
  id: string
  title: string
  company: string
  description: string
  requirements: string[] | null
  extracted_keywords: string[] | null
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
  resumeData?: any
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
  
  return questions.slice(0, 8)
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
  const [inputMode, setInputMode] = useState<'saved' | 'manual'>('saved')
  
  // Refs
  const recognitionRef = useRef<any>(null)
  const synthRef = useRef<SpeechSynthesis | null>(null)

  const supabase = createClient()
  
  // Check for speech support on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setSpeechSupported('speechSynthesis' in window)
      setRecognitionSupported('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)
      synthRef.current = window.speechSynthesis
    }
  }, [])
  
  // Load user's resumes and job descriptions
  useEffect(() => {
    const loadData = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setLoadingResumes(false)
        setLoadingJDs(false)
        return
      }
      
      // Load resumes and JDs in parallel
      const [resumesResult, jdsResult] = await Promise.all([
        (supabase as any)
          .from('resumes')
          .select('id, title, content')
          .eq('user_id', user.id)
          .order('updated_at', { ascending: false }),
        (supabase as any)
          .from('job_descriptions')
          .select('id, title, company, description, requirements, extracted_keywords')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
      ])
      
      if (resumesResult.data) {
        setResumes(resumesResult.data)
      }
      if (jdsResult.data) {
        setSavedJDs(jdsResult.data)
        // If user has saved JDs, default to saved mode; otherwise manual
        if (jdsResult.data.length === 0) {
          setInputMode('manual')
        }
      }
      setLoadingResumes(false)
      setLoadingJDs(false)
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
    if (selectedJDId && inputMode === 'saved') {
      const jd = savedJDs.find(j => j.id === selectedJDId)
      if (jd) {
        setJobTitle(jd.title || '')
        setJobDescription(jd.description || '')
        // Auto-populate skills from JD keywords
        if (jd.extracted_keywords && jd.extracted_keywords.length > 0) {
          setSkills(prev => [...new Set([...prev, ...jd.extracted_keywords!.slice(0, 5)])])
        }
      }
    }
  }, [selectedJDId, savedJDs, inputMode])
  
  // Text-to-Speech function
  const speakText = useCallback((text: string) => {
    if (!speechSupported || !audioEnabled || !synthRef.current) return
    
    // Cancel any ongoing speech
    synthRef.current.cancel()
    
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.rate = 0.9
    utterance.pitch = 1
    utterance.volume = 1
    
    // Try to use a natural voice
    const voices = synthRef.current.getVoices()
    const preferredVoice = voices.find(v => 
      v.name.includes('Google') || v.name.includes('Natural') || v.name.includes('Samantha')
    ) || voices.find(v => v.lang.startsWith('en'))
    
    if (preferredVoice) {
      utterance.voice = preferredVoice
    }
    
    utterance.onstart = () => setIsSpeaking(true)
    utterance.onend = () => setIsSpeaking(false)
    utterance.onerror = () => setIsSpeaking(false)
    
    synthRef.current.speak(utterance)
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

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isTimerRunning) {
      interval = setInterval(() => setTimer(t => t + 1), 1000)
    }
    return () => clearInterval(interval)
  }, [isTimerRunning])

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

  const startPractice = () => {
    const generatedQuestions = generateQuestionsFromContext(jobTitle, jobDescription, skills, selectedResumeData)
    setQuestions(generatedQuestions)
    setStep('practice')
    setCurrentQuestion(0)
    setAnswers([])
    setTimer(0)
    setIsTimerRunning(true)
    
    // Speak the first question after a short delay
    setTimeout(() => {
      if (generatedQuestions.length > 0) {
        speakText(generatedQuestions[0].question)
      }
    }, 500)
  }

  const submitAnswer = async () => {
    setIsGeneratingFeedback(true)
    setIsTimerRunning(false)

    // Simulate AI feedback generation
    await new Promise(resolve => setTimeout(resolve, 1500))

    const feedback = generateFeedback(questions[currentQuestion], currentAnswer)
    const newAnswer: Answer = {
      questionId: questions[currentQuestion].id,
      answer: currentAnswer,
      duration: timer,
      feedback,
    }

    setAnswers([...answers, newAnswer])
    setIsGeneratingFeedback(false)

    if (currentQuestion < questions.length - 1) {
      const nextQ = currentQuestion + 1
      setCurrentQuestion(nextQ)
      setCurrentAnswer('')
      setTimer(0)
      setIsTimerRunning(true)
      
      // Speak the next question
      setTimeout(() => {
        speakText(questions[nextQ].question)
      }, 500)
    } else {
      // Calculate overall score
      const allAnswers = [...answers, newAnswer]
      const avgScore = Math.round(
        allAnswers.reduce((sum, a) => sum + (a.feedback?.score || 0), 0) / allAnswers.length
      )
      setOverallScore(avgScore)
      setStep('review')
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
      const avgScore = Math.round(
        allAnswers.reduce((sum, a) => sum + (a.feedback?.score || 0), 0) / allAnswers.length
      )
      setOverallScore(avgScore)
      setStep('review')
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
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5 text-violet-500" />
                    Set Up Your Practice Session
                  </CardTitle>
                  <CardDescription>
                    Tell us about the role you&apos;re interviewing for to get personalized questions
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Step 1: Job Description Source */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label className="flex items-center gap-2 text-base font-semibold">
                        <Target className="h-4 w-4 text-violet-500" />
                        Step 1: Job Description
                      </Label>
                      {savedJDs.length > 0 && (
                        <div className="flex gap-1 p-1 bg-slate-100 rounded-lg">
                          <Button
                            variant={inputMode === 'saved' ? 'default' : 'ghost'}
                            size="sm"
                            onClick={() => {
                              setInputMode('saved')
                              if (!selectedJDId && savedJDs.length > 0) {
                                setSelectedJDId(savedJDs[0].id)
                              }
                            }}
                            className="text-xs h-7"
                          >
                            Saved JDs
                          </Button>
                          <Button
                            variant={inputMode === 'manual' ? 'default' : 'ghost'}
                            size="sm"
                            onClick={() => {
                              setInputMode('manual')
                              setSelectedJDId('')
                              setJobTitle('')
                              setJobDescription('')
                            }}
                            className="text-xs h-7"
                          >
                            Paste New
                          </Button>
                        </div>
                      )}
                    </div>

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
                    <div className="relative flex justify-center">
                      <span className="bg-white px-3 text-sm text-slate-500">Optional Enhancements</span>
                    </div>
                  </div>

                  {/* Step 2: Resume Selection */}
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-violet-500" />
                      Step 2: Your Resume (Optional)
                    </Label>
                    <p className="text-xs text-slate-500 mb-2">
                      Select a resume to get questions about your specific experience
                    </p>
                    {loadingResumes ? (
                      <div className="flex items-center gap-2 text-sm text-slate-500">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Loading resumes...
                      </div>
                    ) : resumes.length > 0 ? (
                      <Select value={selectedResumeId} onValueChange={setSelectedResumeId}>
                        <SelectTrigger>
                          <SelectValue placeholder="Choose a resume for personalized questions" />
                        </SelectTrigger>
                        <SelectContent>
                          {resumes.map((resume) => (
                            <SelectItem key={resume.id} value={resume.id}>
                              {resume.title || 'Untitled Resume'}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <p className="text-sm text-slate-500 bg-slate-50 p-3 rounded-lg">
                        No resumes found. <a href="/resumes/new" className="text-violet-600 hover:underline">Create one</a> for personalized questions.
                      </p>
                    )}
                  </div>

                  {/* Step 3: Additional Skills */}
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <Zap className="h-4 w-4 text-amber-500" />
                      Step 3: Key Skills
                    </Label>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Add a skill..."
                        value={skillInput}
                        onChange={(e) => setSkillInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && addSkill()}
                      />
                      <Button onClick={addSkill} variant="outline">Add</Button>
                    </div>
                    {skills.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {skills.map((skill) => (
                          <Badge
                            key={skill}
                            variant="secondary"
                            className="cursor-pointer hover:bg-red-100 transition-colors"
                            onClick={() => removeSkill(skill)}
                          >
                            {skill} ×
                          </Badge>
                        ))}
                      </div>
                    )}
                    {skills.length === 0 && (
                      <p className="text-xs text-slate-400">Skills will be auto-extracted from your resume and JD</p>
                    )}
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
                    disabled={!jobTitle || !jobDescription}
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
                        Question {currentQuestion + 1} of {questions.length}
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
                    </div>
                    <div className="flex items-center gap-2 text-slate-600">
                      <Clock className="h-4 w-4" />
                      <span className="font-mono text-lg">{formatTime(timer)}</span>
                    </div>
                  </div>
                  <Progress value={(currentQuestion / questions.length) * 100} className="mt-4" />
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Question with Audio Controls */}
                  <div className="bg-gradient-to-r from-violet-50 to-purple-50 rounded-xl p-6 border border-violet-100">
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
                        value={currentAnswer + (interimTranscript ? ` ${interimTranscript}` : '')}
                        onChange={(e) => setCurrentAnswer(e.target.value)}
                        rows={6}
                        className={`resize-none ${isRecording ? 'border-red-300 bg-red-50/50' : ''}`}
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
                    <div className="flex justify-between text-sm text-slate-500">
                      <span>{currentAnswer.split(' ').filter(w => w).length} words</span>
                      <span>Aim for 50-150 words</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      onClick={() => {
                        stopRecording()
                        stopSpeaking()
                        skipQuestion()
                      }}
                      className="flex-1"
                    >
                      Skip Question
                    </Button>
                    <Button
                      onClick={() => {
                        stopRecording()
                        stopSpeaking()
                        submitAnswer()
                      }}
                      disabled={!currentAnswer.trim() || isGeneratingFeedback}
                      className="flex-1 bg-gradient-to-r from-violet-500 to-purple-500 hover:from-violet-600 hover:to-purple-600"
                    >
                      {isGeneratingFeedback ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Analyzing...
                        </>
                      ) : (
                        <>
                          <Sparkles className="mr-2 h-4 w-4" />
                          Submit & Get Feedback
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
                          <p className="text-slate-800">{questions[index]?.question}</p>
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
  )
}
