'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  Mic, MicOff, Play, Pause, RotateCcw, ChevronRight, ChevronLeft,
  Sparkles, MessageSquare, ThumbsUp, ThumbsDown, Target, Trophy,
  Lightbulb, Clock, CheckCircle, AlertCircle, Loader2, Volume2,
  Brain, Zap, Star, Award, TrendingUp
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

// Sample questions based on common interview patterns
const generateQuestions = (jobTitle: string, skills: string[]): Question[] => {
  const behavioralQuestions = [
    { q: "Tell me about a time when you had to lead a team through a challenging project.", type: 'behavioral' as const, difficulty: 'medium' as const },
    { q: "Describe a situation where you had to deal with a difficult colleague or stakeholder.", type: 'behavioral' as const, difficulty: 'medium' as const },
    { q: "Give an example of when you had to learn something new quickly to complete a task.", type: 'behavioral' as const, difficulty: 'easy' as const },
    { q: "Tell me about a time you failed and what you learned from it.", type: 'behavioral' as const, difficulty: 'hard' as const },
    { q: "Describe a situation where you had to make a decision with incomplete information.", type: 'behavioral' as const, difficulty: 'hard' as const },
  ]

  const technicalQuestions = [
    { q: `What experience do you have with ${skills[0] || 'the technologies'} mentioned in your resume?`, type: 'technical' as const, difficulty: 'easy' as const },
    { q: "Walk me through your approach to solving a complex technical problem.", type: 'technical' as const, difficulty: 'medium' as const },
    { q: "How do you stay updated with the latest trends and technologies in your field?", type: 'technical' as const, difficulty: 'easy' as const },
    { q: `Can you explain a project where you used ${skills[1] || 'your technical skills'} effectively?`, type: 'technical' as const, difficulty: 'medium' as const },
  ]

  const situationalQuestions = [
    { q: `Why are you interested in this ${jobTitle} position?`, type: 'situational' as const, difficulty: 'easy' as const },
    { q: "Where do you see yourself in 5 years?", type: 'situational' as const, difficulty: 'medium' as const },
    { q: "How would you handle a situation where you disagree with your manager's decision?", type: 'situational' as const, difficulty: 'hard' as const },
    { q: "What would you do if you were given a tight deadline that you knew was unrealistic?", type: 'situational' as const, difficulty: 'medium' as const },
  ]

  const allQuestions = [...behavioralQuestions, ...technicalQuestions, ...situationalQuestions]
  const shuffled = allQuestions.sort(() => Math.random() - 0.5).slice(0, 8)

  return shuffled.map((q, i) => ({
    id: i + 1,
    question: q.q,
    type: q.type,
    difficulty: q.difficulty,
    tips: getTipsForType(q.type),
  }))
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

  const supabase = createClient()

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
    const generatedQuestions = generateQuestions(jobTitle, skills)
    setQuestions(generatedQuestions)
    setStep('practice')
    setCurrentQuestion(0)
    setAnswers([])
    setTimer(0)
    setIsTimerRunning(true)
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
      setCurrentQuestion(currentQuestion + 1)
      setCurrentAnswer('')
      setTimer(0)
      setIsTimerRunning(true)
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
                  <div className="space-y-2">
                    <Label htmlFor="jobTitle">Job Title</Label>
                    <Input
                      id="jobTitle"
                      placeholder="e.g., Senior Software Engineer"
                      value={jobTitle}
                      onChange={(e) => setJobTitle(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="jobDescription">Job Description (Optional)</Label>
                    <Textarea
                      id="jobDescription"
                      placeholder="Paste the job description here for more tailored questions..."
                      value={jobDescription}
                      onChange={(e) => setJobDescription(e.target.value)}
                      rows={4}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Key Skills</Label>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Add a skill..."
                        value={skillInput}
                        onChange={(e) => setSkillInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && addSkill()}
                      />
                      <Button onClick={addSkill} variant="outline">Add</Button>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {skills.map((skill) => (
                        <Badge
                          key={skill}
                          variant="secondary"
                          className="cursor-pointer hover:bg-red-100"
                          onClick={() => removeSkill(skill)}
                        >
                          {skill} ×
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="bg-violet-50 rounded-xl p-4 border border-violet-100">
                    <div className="flex items-start gap-3">
                      <Lightbulb className="h-5 w-5 text-violet-500 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-violet-800">Pro Tips</h4>
                        <ul className="text-sm text-violet-600 mt-1 space-y-1">
                          <li>• Add 3-5 key skills from your resume</li>
                          <li>• Include both technical and soft skills</li>
                          <li>• The more context you provide, the better the questions</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <Button
                    onClick={startPractice}
                    disabled={!jobTitle}
                    className="w-full bg-gradient-to-r from-violet-500 to-purple-500 hover:from-violet-600 hover:to-purple-600"
                    size="lg"
                  >
                    <Play className="mr-2 h-5 w-5" />
                    Start Practice Session
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
                  {/* Question */}
                  <div className="bg-gradient-to-r from-violet-50 to-purple-50 rounded-xl p-6 border border-violet-100">
                    <div className="flex items-start gap-3">
                      <MessageSquare className="h-6 w-6 text-violet-500 mt-1" />
                      <p className="text-lg text-slate-800 font-medium">
                        {questions[currentQuestion].question}
                      </p>
                    </div>
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

                  {/* Answer Input */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label>Your Answer</Label>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowTips(!showTips)}
                      >
                        {showTips ? 'Hide Tips' : 'Show Tips'}
                      </Button>
                    </div>
                    <Textarea
                      placeholder="Type your answer here... Be specific and use examples from your experience."
                      value={currentAnswer}
                      onChange={(e) => setCurrentAnswer(e.target.value)}
                      rows={6}
                      className="resize-none"
                    />
                    <div className="flex justify-between text-sm text-slate-500">
                      <span>{currentAnswer.split(' ').filter(w => w).length} words</span>
                      <span>Aim for 50-150 words</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      onClick={skipQuestion}
                      className="flex-1"
                    >
                      Skip Question
                    </Button>
                    <Button
                      onClick={submitAnswer}
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

          {/* Review Step */}
          {step === 'review' && (
            <motion.div
              key="review"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              {/* Overall Score Card */}
              <Card className="overflow-hidden">
                <div className="bg-gradient-to-r from-violet-500 to-purple-500 p-6 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-xl font-semibold mb-1">Practice Session Complete!</h2>
                      <p className="text-violet-100">Here&apos;s how you performed</p>
                    </div>
                    <div className="text-center">
                      <div className="text-5xl font-bold">{overallScore}</div>
                      <div className="text-violet-100 text-sm">Overall Score</div>
                    </div>
                  </div>
                </div>
                <CardContent className="p-6">
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div className="p-4 rounded-xl bg-emerald-50">
                      <Trophy className="h-6 w-6 text-emerald-500 mx-auto mb-2" />
                      <div className="text-2xl font-bold text-emerald-600">
                        {answers.filter(a => (a.feedback?.score || 0) >= 70).length}
                      </div>
                      <div className="text-sm text-emerald-600">Strong Answers</div>
                    </div>
                    <div className="p-4 rounded-xl bg-amber-50">
                      <TrendingUp className="h-6 w-6 text-amber-500 mx-auto mb-2" />
                      <div className="text-2xl font-bold text-amber-600">
                        {answers.filter(a => (a.feedback?.score || 0) >= 50 && (a.feedback?.score || 0) < 70).length}
                      </div>
                      <div className="text-sm text-amber-600">Need Work</div>
                    </div>
                    <div className="p-4 rounded-xl bg-violet-50">
                      <Clock className="h-6 w-6 text-violet-500 mx-auto mb-2" />
                      <div className="text-2xl font-bold text-violet-600">
                        {formatTime(answers.reduce((sum, a) => sum + a.duration, 0))}
                      </div>
                      <div className="text-sm text-violet-600">Total Time</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Individual Question Reviews */}
              {answers.map((answer, index) => (
                <Card key={index}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          (answer.feedback?.score || 0) >= 70 ? 'bg-emerald-100' :
                          (answer.feedback?.score || 0) >= 50 ? 'bg-amber-100' : 'bg-red-100'
                        }`}>
                          <span className={`font-bold ${getScoreColor(answer.feedback?.score || 0)}`}>
                            {answer.feedback?.score || 0}
                          </span>
                        </div>
                        <div>
                          <CardTitle className="text-base">Question {index + 1}</CardTitle>
                          <CardDescription>{questions[index]?.question}</CardDescription>
                        </div>
                      </div>
                      <Badge className={`${
                        (answer.feedback?.score || 0) >= 70 ? 'bg-emerald-100 text-emerald-700' :
                        (answer.feedback?.score || 0) >= 50 ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {getScoreLabel(answer.feedback?.score || 0)}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {answer.answer ? (
                      <>
                        <div className="bg-slate-50 rounded-lg p-4">
                          <h4 className="text-sm font-medium text-slate-600 mb-2">Your Answer:</h4>
                          <p className="text-slate-800">{answer.answer}</p>
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
                          <div className="bg-violet-50 rounded-lg p-4">
                            <div className="flex items-center gap-2 mb-2">
                              <Sparkles className="h-4 w-4 text-violet-500" />
                              <h4 className="font-medium text-violet-700">Sample Strong Answer</h4>
                            </div>
                            <p className="text-sm text-violet-600">{answer.feedback.sampleAnswer}</p>
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="text-center py-4 text-slate-500">
                        <AlertCircle className="h-8 w-8 mx-auto mb-2 text-slate-400" />
                        <p>This question was skipped</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}

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
