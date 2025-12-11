'use client'

import { useState, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { Json } from '@/types/database'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { 
  FileText, Upload, ArrowLeft, ArrowRight, Loader2, Plus, Trash2, Check,
  User, Briefcase, GraduationCap, Wrench, File, X, AlertCircle
} from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'
import { Progress } from '@/components/ui/progress'

interface Experience {
  id: string
  company: string
  position: string
  location: string
  startDate: string
  endDate: string
  current: boolean
  description: string
}

interface Education {
  id: string
  institution: string
  degree: string
  field: string
  startDate: string
  endDate: string
  gpa: string
}

const STEPS = [
  { id: 'contact', label: 'Contact', icon: User },
  { id: 'experience', label: 'Experience', icon: Briefcase },
  { id: 'education', label: 'Education', icon: GraduationCap },
  { id: 'skills', label: 'Skills', icon: Wrench },
]

const SKILL_SUGGESTIONS = [
  'JavaScript', 'TypeScript', 'React', 'Node.js', 'Python', 'Java', 'SQL',
  'AWS', 'Docker', 'Git', 'Agile', 'Project Management', 'Communication',
  'Leadership', 'Problem Solving', 'Data Analysis', 'Machine Learning'
]

export default function NewResumePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [mode, setMode] = useState<'choose' | 'manual' | 'upload'>('choose')
  const [currentStep, setCurrentStep] = useState(0)
  
  // Form state
  const [title, setTitle] = useState('My Resume')
  const [contact, setContact] = useState({
    name: '',
    email: '',
    phone: '',
    linkedin: '',
    location: '',
    website: '',
  })
  const [summary, setSummary] = useState('')
  const [experience, setExperience] = useState<Experience[]>([])
  const [education, setEducation] = useState<Education[]>([])
  const [skills, setSkills] = useState<string[]>([])
  const [newSkill, setNewSkill] = useState('')
  
  // Upload state
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploading, setUploading] = useState(false)
  const [parsing, setParsing] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleCreateResume = async () => {
    setLoading(true)
    const supabase = createClient()
    
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      toast.error('Please login to create a resume')
      router.push('/login')
      return
    }

    const { data, error } = await supabase
      .from('resumes')
      .insert({
        user_id: user.id,
        title,
        contact: contact as unknown as Json,
        summary,
        experience: experience as unknown as Json,
        education: education as unknown as Json,
        skills,
      })
      .select()
      .single()

    if (error) {
      toast.error('Failed to create resume')
      setLoading(false)
      return
    }

    toast.success('Resume created successfully!')
    router.push(`/resumes/${data.id}`)
  }

  const addExperience = () => {
    setExperience([...experience, {
      id: crypto.randomUUID(),
      company: '',
      position: '',
      location: '',
      startDate: '',
      endDate: '',
      current: false,
      description: '',
    }])
  }

  const updateExperience = (id: string, field: keyof Experience, value: string | boolean) => {
    setExperience(experience.map(exp => 
      exp.id === id ? { ...exp, [field]: value } : exp
    ))
  }

  const removeExperience = (id: string) => {
    setExperience(experience.filter(exp => exp.id !== id))
  }

  const addEducation = () => {
    setEducation([...education, {
      id: crypto.randomUUID(),
      institution: '',
      degree: '',
      field: '',
      startDate: '',
      endDate: '',
      gpa: '',
    }])
  }

  const updateEducation = (id: string, field: keyof Education, value: string) => {
    setEducation(education.map(edu => 
      edu.id === id ? { ...edu, [field]: value } : edu
    ))
  }

  const removeEducation = (id: string) => {
    setEducation(education.filter(edu => edu.id !== id))
  }

  const addSkill = (skill: string) => {
    const trimmed = skill.trim()
    if (trimmed && !skills.includes(trimmed)) {
      setSkills([...skills, trimmed])
    }
    setNewSkill('')
  }

  const removeSkill = (skill: string) => {
    setSkills(skills.filter(s => s !== skill))
  }

  const nextStep = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  // File upload handlers
  const validateFile = (file: File): boolean => {
    const validTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
    const maxSize = 10 * 1024 * 1024 // 10MB

    if (!validTypes.includes(file.type)) {
      toast.error('Please upload a PDF or DOCX file')
      return false
    }

    if (file.size > maxSize) {
      toast.error('File size must be less than 10MB')
      return false
    }

    return true
  }

  const handleFileSelect = useCallback((file: File) => {
    if (validateFile(file)) {
      setUploadedFile(file)
      setUploadProgress(0)
    }
  }, [])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)

    const files = e.dataTransfer.files
    if (files.length > 0) {
      handleFileSelect(files[0])
    }
  }, [handleFileSelect])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      handleFileSelect(files[0])
    }
  }

  const removeFile = () => {
    setUploadedFile(null)
    setUploadProgress(0)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleUploadAndParse = async () => {
    if (!uploadedFile) return

    setUploading(true)
    setUploadProgress(10)
    const supabase = createClient()
    
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      toast.error('Please login to upload a resume')
      router.push('/login')
      return
    }

    try {
      // Step 1: Parse the resume with AI
      setUploadProgress(20)
      setParsing(true)
      
      const formData = new FormData()
      formData.append('file', uploadedFile)

      const parseResponse = await fetch('/api/parse-resume', {
        method: 'POST',
        body: formData,
      })

      setUploadProgress(60)

      if (!parseResponse.ok) {
        const errorData = await parseResponse.json()
        throw new Error(errorData.error || 'Failed to parse resume')
      }

      const { data: parsedData } = await parseResponse.json()
      setUploadProgress(80)

      // Step 2: Upload file to Supabase Storage (optional)
      const fileExt = uploadedFile.name.split('.').pop()
      const fileName = `${user.id}/${Date.now()}.${fileExt}`
      
      let fileUrl = null
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('resumes')
        .upload(fileName, uploadedFile)

      if (!uploadError && uploadData) {
        const { data: { publicUrl } } = supabase.storage
          .from('resumes')
          .getPublicUrl(fileName)
        fileUrl = publicUrl
      }

      setUploadProgress(90)

      // Step 3: Create resume entry with parsed data
      const { data: resumeData, error: resumeError } = await supabase
        .from('resumes')
        .insert({
          user_id: user.id,
          title: parsedData.contact?.name 
            ? `${parsedData.contact.name}'s Resume` 
            : uploadedFile.name.replace(/\.[^/.]+$/, ''),
          raw_file_url: fileUrl,
          contact: (parsedData.contact || {}) as unknown as Json,
          summary: parsedData.summary || '',
          experience: (parsedData.experience || []) as unknown as Json,
          education: (parsedData.education || []) as unknown as Json,
          skills: parsedData.skills || [],
        })
        .select()
        .single()

      setUploadProgress(100)
      setParsing(false)
      setUploading(false)

      if (resumeError) {
        toast.error('Failed to create resume')
        return
      }

      toast.success('Resume parsed successfully! Review your details.')
      router.push(`/resumes/${resumeData.id}`)

    } catch (error) {
      console.error('Upload error:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to process resume')
      setUploading(false)
      setParsing(false)
      setUploadProgress(0)
    }
  }

  // Choose mode screen
  if (mode === 'choose') {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link href="/resumes">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Create New Resume</h1>
            <p className="text-muted-foreground mt-1">
              Choose how you want to create your resume
            </p>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2 max-w-3xl">
          <Card 
            className="cursor-pointer hover:border-primary transition-colors"
            onClick={() => setMode('manual')}
          >
            <CardHeader>
              <div className="p-3 bg-primary/10 rounded-lg w-fit mb-2">
                <FileText className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>Start from Scratch</CardTitle>
              <CardDescription>
                Build your resume step by step with our guided form
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full">Get Started</Button>
            </CardContent>
          </Card>

          <Card 
            className="cursor-pointer hover:border-primary transition-colors"
            onClick={() => setMode('upload')}
          >
            <CardHeader>
              <div className="p-3 bg-violet-500/10 rounded-lg w-fit mb-2">
                <Upload className="h-6 w-6 text-violet-500" />
              </div>
              <CardTitle>Upload Existing Resume</CardTitle>
              <CardDescription>
                Upload a PDF or DOCX and we&apos;ll extract the content
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="secondary" className="w-full">Upload File</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  // Upload mode screen
  if (mode === 'upload') {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => setMode('choose')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Upload Resume</h1>
            <p className="text-muted-foreground mt-1">
              Upload your existing resume to get started
            </p>
          </div>
        </div>

        <Card className="max-w-2xl">
          <CardContent className="pt-6">
            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              onChange={handleInputChange}
              className="hidden"
            />

            {!uploadedFile ? (
              // Drop zone
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-colors ${
                  isDragging 
                    ? 'border-primary bg-primary/5' 
                    : 'border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/50'
                }`}
              >
                <Upload className={`h-12 w-12 mx-auto mb-4 ${isDragging ? 'text-primary' : 'text-muted-foreground'}`} />
                <h3 className="text-lg font-semibold mb-2">
                  {isDragging ? 'Drop your file here' : 'Drop your resume here'}
                </h3>
                <p className="text-muted-foreground mb-4">
                  Supports PDF and DOCX files up to 10MB
                </p>
                <Button type="button" variant="default">
                  <Upload className="mr-2 h-4 w-4" />
                  Browse Files
                </Button>
              </div>
            ) : (
              // File selected
              <div className="space-y-4">
                <div className="flex items-center gap-4 p-4 border rounded-lg bg-muted/30">
                  <div className="p-3 bg-primary/10 rounded-lg">
                    <File className="h-8 w-8 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{uploadedFile.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                  {!uploading && !parsing && (
                    <Button variant="ghost" size="icon" onClick={removeFile}>
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>

                {/* Progress bar */}
                {(uploading || parsing) && (
                  <div className="space-y-2">
                    <Progress value={uploadProgress} className="h-2" />
                    <p className="text-sm text-center text-muted-foreground">
                      {parsing ? 'Processing your resume...' : `Uploading... ${uploadProgress}%`}
                    </p>
                  </div>
                )}

                {/* Action buttons */}
                {!uploading && !parsing && (
                  <div className="flex gap-3">
                    <Button 
                      variant="outline" 
                      className="flex-1"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      Choose Different File
                    </Button>
                    <Button 
                      className="flex-1"
                      onClick={handleUploadAndParse}
                    >
                      <Upload className="mr-2 h-4 w-4" />
                      Upload & Continue
                    </Button>
                  </div>
                )}
              </div>
            )}

            <div className="flex items-start gap-2 mt-4 p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg">
              <AlertCircle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-blue-700 dark:text-blue-400">
                Your resume will be parsed using AI to extract all relevant information. 
                You can review and edit the extracted data before saving.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Manual form with steps
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => setMode('choose')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Create Resume</h1>
          <p className="text-muted-foreground mt-1">
            Fill in your information step by step
          </p>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center justify-between max-w-2xl">
        {STEPS.map((step, index) => {
          const Icon = step.icon
          const isActive = index === currentStep
          const isCompleted = index < currentStep
          
          return (
            <div key={step.id} className="flex items-center">
              <button
                onClick={() => setCurrentStep(index)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                  isActive 
                    ? 'bg-primary text-primary-foreground' 
                    : isCompleted 
                      ? 'bg-primary/10 text-primary' 
                      : 'bg-muted text-muted-foreground'
                }`}
              >
                {isCompleted ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <Icon className="h-4 w-4" />
                )}
                <span className="hidden sm:inline font-medium">{step.label}</span>
              </button>
              {index < STEPS.length - 1 && (
                <div className={`w-8 h-0.5 mx-2 ${isCompleted ? 'bg-primary' : 'bg-muted'}`} />
              )}
            </div>
          )
        })}
      </div>

      <div className="max-w-2xl">
        {/* Step 1: Contact */}
        {currentStep === 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
              <CardDescription>
                Start with your contact details and a brief summary
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Resume Title</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., Software Engineer Resume"
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name *</Label>
                  <Input
                    id="name"
                    value={contact.name}
                    onChange={(e) => setContact({ ...contact, name: e.target.value })}
                    placeholder="John Doe"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={contact.email}
                    onChange={(e) => setContact({ ...contact, email: e.target.value })}
                    placeholder="john@example.com"
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={contact.phone}
                    onChange={(e) => setContact({ ...contact, phone: e.target.value })}
                    placeholder="+1 (555) 000-0000"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={contact.location}
                    onChange={(e) => setContact({ ...contact, location: e.target.value })}
                    placeholder="San Francisco, CA"
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="linkedin">LinkedIn URL</Label>
                  <Input
                    id="linkedin"
                    value={contact.linkedin}
                    onChange={(e) => setContact({ ...contact, linkedin: e.target.value })}
                    placeholder="https://linkedin.com/in/johndoe"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="website">Website / Portfolio</Label>
                  <Input
                    id="website"
                    value={contact.website}
                    onChange={(e) => setContact({ ...contact, website: e.target.value })}
                    placeholder="https://johndoe.com"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="summary">Professional Summary</Label>
                <Textarea
                  id="summary"
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  placeholder="A brief summary of your professional background and career objectives..."
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Experience */}
        {currentStep === 1 && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Work Experience</CardTitle>
                  <CardDescription>
                    Add your work history, starting with the most recent
                  </CardDescription>
                </div>
                <Button onClick={addExperience} size="sm">
                  <Plus className="h-4 w-4 mr-1" />
                  Add
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {experience.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Briefcase className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No experience added yet</p>
                  <Button onClick={addExperience} variant="outline" className="mt-4">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Experience
                  </Button>
                </div>
              ) : (
                experience.map((exp, index) => (
                  <div key={exp.id} className="border rounded-lg p-4 space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">Experience {index + 1}</h4>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => removeExperience(exp.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                    
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label>Company *</Label>
                        <Input
                          value={exp.company}
                          onChange={(e) => updateExperience(exp.id, 'company', e.target.value)}
                          placeholder="Company Name"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Position *</Label>
                        <Input
                          value={exp.position}
                          onChange={(e) => updateExperience(exp.id, 'position', e.target.value)}
                          placeholder="Job Title"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Location</Label>
                      <Input
                        value={exp.location}
                        onChange={(e) => updateExperience(exp.id, 'location', e.target.value)}
                        placeholder="City, State"
                      />
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label>Start Date</Label>
                        <Input
                          type="month"
                          value={exp.startDate}
                          onChange={(e) => updateExperience(exp.id, 'startDate', e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>End Date</Label>
                        <Input
                          type="month"
                          value={exp.endDate}
                          onChange={(e) => updateExperience(exp.id, 'endDate', e.target.value)}
                          disabled={exp.current}
                        />
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id={`current-${exp.id}`}
                        checked={exp.current}
                        onCheckedChange={(checked) => updateExperience(exp.id, 'current', !!checked)}
                      />
                      <Label htmlFor={`current-${exp.id}`} className="font-normal">
                        I currently work here
                      </Label>
                    </div>

                    <div className="space-y-2">
                      <Label>Description</Label>
                      <Textarea
                        value={exp.description}
                        onChange={(e) => updateExperience(exp.id, 'description', e.target.value)}
                        placeholder="Describe your responsibilities and achievements..."
                        rows={4}
                      />
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        )}

        {/* Step 3: Education */}
        {currentStep === 2 && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Education</CardTitle>
                  <CardDescription>
                    Add your educational background
                  </CardDescription>
                </div>
                <Button onClick={addEducation} size="sm">
                  <Plus className="h-4 w-4 mr-1" />
                  Add
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {education.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <GraduationCap className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No education added yet</p>
                  <Button onClick={addEducation} variant="outline" className="mt-4">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Education
                  </Button>
                </div>
              ) : (
                education.map((edu, index) => (
                  <div key={edu.id} className="border rounded-lg p-4 space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">Education {index + 1}</h4>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => removeEducation(edu.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Institution *</Label>
                      <Input
                        value={edu.institution}
                        onChange={(e) => updateEducation(edu.id, 'institution', e.target.value)}
                        placeholder="University Name"
                      />
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label>Degree *</Label>
                        <Input
                          value={edu.degree}
                          onChange={(e) => updateEducation(edu.id, 'degree', e.target.value)}
                          placeholder="e.g., Bachelor's, Master's"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Field of Study</Label>
                        <Input
                          value={edu.field}
                          onChange={(e) => updateEducation(edu.id, 'field', e.target.value)}
                          placeholder="e.g., Computer Science"
                        />
                      </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-3">
                      <div className="space-y-2">
                        <Label>Start Date</Label>
                        <Input
                          type="month"
                          value={edu.startDate}
                          onChange={(e) => updateEducation(edu.id, 'startDate', e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>End Date</Label>
                        <Input
                          type="month"
                          value={edu.endDate}
                          onChange={(e) => updateEducation(edu.id, 'endDate', e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>GPA (Optional)</Label>
                        <Input
                          value={edu.gpa}
                          onChange={(e) => updateEducation(edu.id, 'gpa', e.target.value)}
                          placeholder="e.g., 3.8/4.0"
                        />
                      </div>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        )}

        {/* Step 4: Skills */}
        {currentStep === 3 && (
          <Card>
            <CardHeader>
              <CardTitle>Skills</CardTitle>
              <CardDescription>
                Add your technical and soft skills
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  placeholder="Type a skill and press Enter"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      addSkill(newSkill)
                    }
                  }}
                />
                <Button onClick={() => addSkill(newSkill)} disabled={!newSkill.trim()}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              {skills.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {skills.map((skill) => (
                    <span
                      key={skill}
                      className="inline-flex items-center gap-1 px-3 py-1 bg-primary/10 text-primary rounded-full text-sm"
                    >
                      {skill}
                      <button
                        onClick={() => removeSkill(skill)}
                        className="hover:bg-primary/20 rounded-full p-0.5"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}

              <div className="pt-4">
                <Label className="text-muted-foreground">Suggested Skills</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {SKILL_SUGGESTIONS.filter(s => !skills.includes(s)).slice(0, 12).map((skill) => (
                    <button
                      key={skill}
                      onClick={() => addSkill(skill)}
                      className="px-3 py-1 border rounded-full text-sm hover:bg-accent transition-colors"
                    >
                      + {skill}
                    </button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Navigation */}
        <div className="flex justify-between mt-6">
          <Button 
            variant="outline" 
            onClick={currentStep === 0 ? () => setMode('choose') : prevStep}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            {currentStep === 0 ? 'Back' : 'Previous'}
          </Button>
          
          {currentStep < STEPS.length - 1 ? (
            <Button onClick={nextStep}>
              Next
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          ) : (
            <Button onClick={handleCreateResume} disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  Create Resume
                  <Check className="h-4 w-4 ml-2" />
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
