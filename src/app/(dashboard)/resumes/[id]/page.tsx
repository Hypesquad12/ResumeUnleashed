'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { Json } from '@/types/database'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  ArrowLeft, Save, Loader2, Plus, Trash2, GripVertical,
  User, Briefcase, GraduationCap, Wrench, Eye, Sparkles, Palette, Check, Crown,
  Share2, Copy, ExternalLink, Camera, Upload, X
} from 'lucide-react'
import { QRCodeSVG } from 'qrcode.react'
import Link from 'next/link'
import { toast } from 'sonner'
import { TEMPLATES, getTemplateById } from '@/components/templates/types'
import { Badge } from '@/components/ui/badge'

interface ContactInfo {
  name: string
  email: string
  phone: string
  linkedin: string
  location: string
  website?: string
}

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

interface ResumeData {
  id: string
  title: string
  contact: ContactInfo
  summary: string
  experience: Experience[]
  education: Education[]
  skills: string[]
  template: string
  photo_url?: string
}

export default function ResumeEditorPage() {
  const router = useRouter()
  const params = useParams()
  const resumeId = params.id as string
  
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [resume, setResume] = useState<ResumeData | null>(null)
  const [activeTab, setActiveTab] = useState('contact')
  const [publicSlug, setPublicSlug] = useState<string | null>(null)
  const [creatingLink, setCreatingLink] = useState(false)
  const [newSkill, setNewSkill] = useState('')

  useEffect(() => {
    loadResume()
  // eslint-disable-next-line react-hooks/exhaustive-deps
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

    setResume({
      id: data.id,
      title: data.title || 'Untitled Resume',
      contact,
      summary: data.summary || '',
      experience,
      education,
      skills,
      template: (data.template as string) || 'classic',
      photo_url: ((data as any).photo_url as string) || undefined,
    })
    setLoading(false)

    // Load existing public link if any
    loadPublicLink()
  }

  const loadPublicLink = async () => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data: link } = await supabase
      .from('public_resume_links')
      .select('public_slug')
      .eq('user_id', user.id)
      .eq('resume_id', resumeId)
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (link?.public_slug) {
      setPublicSlug(link.public_slug)
    }
  }

  const createPublicLink = async () => {
    if (publicSlug) return // Already exists

    setCreatingLink(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      toast.error('Please login to create a share link')
      setCreatingLink(false)
      return
    }

    const slugBase = (resume?.title || 'resume')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
      .slice(0, 40)
    const slug = `${slugBase}-${Math.random().toString(36).substring(2, 7)}`

    const { data, error } = await supabase
      .from('public_resume_links')
      .insert({
        user_id: user.id,
        public_slug: slug,
        resume_id: resumeId,
        is_active: true,
      })
      .select('public_slug')
      .single()

    if (error) {
      toast.error('Failed to create share link')
      console.error(error)
    } else if (data?.public_slug) {
      setPublicSlug(data.public_slug)
      toast.success('Share link created!')
    }
    setCreatingLink(false)
  }

  const getShareableLink = () => {
    if (!publicSlug) return ''
    return `${window.location.origin}/r/${publicSlug}`
  }

  const handleCopyLink = async () => {
    const link = getShareableLink()
    if (!link) {
      toast.error('Create a share link first')
      return
    }
    await navigator.clipboard.writeText(link)
    toast.success('Link copied to clipboard!')
  }

  const saveResume = async () => {
    if (!resume) return
    setSaving(true)

    const supabase = createClient()
    const { error } = await supabase
      .from('resumes')
      .update({
        title: resume.title,
        contact: resume.contact as unknown as Json,
        summary: resume.summary,
        experience: resume.experience as unknown as Json,
        education: resume.education as unknown as Json,
        skills: resume.skills,
        template: resume.template,
        photo_url: resume.photo_url || null,
        updated_at: new Date().toISOString(),
      } as any)
      .eq('id', resumeId)

    if (error) {
      toast.error('Failed to save resume')
      setSaving(false)
    } else {
      toast.success('Resume saved! Redirecting to AI Customize...')
      // Redirect to customize page after successful save
      setTimeout(() => {
        router.push('/customize')
      }, 1000)
    }
  }

  const [uploadingPhoto, setUploadingPhoto] = useState(false)

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be less than 5MB')
      return
    }

    setUploadingPhoto(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      toast.error('Please login to upload a photo')
      setUploadingPhoto(false)
      return
    }

    const fileExt = file.name.split('.').pop()
    const fileName = `${user.id}/${resumeId}-photo.${fileExt}`

    const { error: uploadError } = await supabase.storage
      .from('resume-assets')
      .upload(fileName, file, { upsert: true })

    if (uploadError) {
      toast.error('Failed to upload photo')
      console.error(uploadError)
      setUploadingPhoto(false)
      return
    }

    const { data: { publicUrl } } = supabase.storage
      .from('resume-assets')
      .getPublicUrl(fileName)

    setResume(prev => prev ? { ...prev, photo_url: publicUrl } : prev)
    toast.success('Photo uploaded! Remember to save your resume.')
    setUploadingPhoto(false)
  }

  const removePhoto = () => {
    setResume(prev => prev ? { ...prev, photo_url: undefined } : prev)
    toast.info('Photo removed. Remember to save your resume.')
  }

  const addExperience = () => {
    if (!resume) return
    const newExp: Experience = {
      id: crypto.randomUUID(),
      company: '',
      position: '',
      location: '',
      startDate: '',
      endDate: '',
      current: false,
      description: '',
    }
    setResume({ ...resume, experience: [...resume.experience, newExp] })
  }

  const updateExperience = (id: string, field: keyof Experience, value: string | boolean) => {
    if (!resume) return
    setResume({
      ...resume,
      experience: resume.experience.map(exp =>
        exp.id === id ? { ...exp, [field]: value } : exp
      ),
    })
  }

  const removeExperience = (id: string) => {
    if (!resume) return
    setResume({
      ...resume,
      experience: resume.experience.filter(exp => exp.id !== id),
    })
  }

  const addEducation = () => {
    if (!resume) return
    const newEdu: Education = {
      id: crypto.randomUUID(),
      institution: '',
      degree: '',
      field: '',
      startDate: '',
      endDate: '',
      gpa: '',
    }
    setResume({ ...resume, education: [...resume.education, newEdu] })
  }

  const updateEducation = (id: string, field: keyof Education, value: string) => {
    if (!resume) return
    setResume({
      ...resume,
      education: resume.education.map(edu =>
        edu.id === id ? { ...edu, [field]: value } : edu
      ),
    })
  }

  const removeEducation = (id: string) => {
    if (!resume) return
    setResume({
      ...resume,
      education: resume.education.filter(edu => edu.id !== id),
    })
  }

  const addSkill = () => {
    if (!resume || !newSkill.trim()) return
    if (!resume.skills.includes(newSkill.trim())) {
      setResume({ ...resume, skills: [...resume.skills, newSkill.trim()] })
    }
    setNewSkill('')
  }

  const removeSkill = (skill: string) => {
    if (!resume) return
    setResume({
      ...resume,
      skills: resume.skills.filter(s => s !== skill),
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!resume) return null

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/resumes">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <Input
              value={resume.title}
              onChange={(e) => setResume({ ...resume, title: e.target.value })}
              className="text-2xl font-bold border-none p-0 h-auto focus-visible:ring-0 bg-transparent"
              placeholder="Resume Title"
            />
            <p className="text-sm text-muted-foreground mt-1">
              Edit your resume details below
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link href={`/resumes/${resumeId}/preview`}>
            <Button variant="outline">
              <Eye className="mr-2 h-4 w-4" />
              Preview
            </Button>
          </Link>
          <Link href={`/customize?resume=${resumeId}`}>
            <Button variant="outline">
              <Sparkles className="mr-2 h-4 w-4" />
              AI Customize
            </Button>
          </Link>
          <Button onClick={saveResume} disabled={saving}>
            {saving ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            Save
          </Button>
        </div>
      </div>

      {/* Editor Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-6 lg:w-auto lg:inline-grid">
          <TabsTrigger value="contact" className="gap-2">
            <User className="h-4 w-4" />
            <span className="hidden sm:inline">Contact</span>
          </TabsTrigger>
          <TabsTrigger value="experience" className="gap-2">
            <Briefcase className="h-4 w-4" />
            <span className="hidden sm:inline">Experience</span>
          </TabsTrigger>
          <TabsTrigger value="education" className="gap-2">
            <GraduationCap className="h-4 w-4" />
            <span className="hidden sm:inline">Education</span>
          </TabsTrigger>
          <TabsTrigger value="skills" className="gap-2">
            <Wrench className="h-4 w-4" />
            <span className="hidden sm:inline">Skills</span>
          </TabsTrigger>
          <TabsTrigger value="template" className="gap-2">
            <Palette className="h-4 w-4" />
            <span className="hidden sm:inline">Template</span>
          </TabsTrigger>
          <TabsTrigger value="share" className="gap-2">
            <Share2 className="h-4 w-4" />
            <span className="hidden sm:inline">Share</span>
          </TabsTrigger>
        </TabsList>

        {/* Contact Tab */}
        <TabsContent value="contact" className="space-y-6">
          {/* Profile Photo */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Camera className="h-5 w-5" />
                Profile Photo
              </CardTitle>
              <CardDescription>
                Add a professional photo to your resume (optional, shown on some templates)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-6">
                <div className="relative">
                  {resume.photo_url ? (
                    <div className="relative w-24 h-24 rounded-full overflow-hidden border-2 border-primary/20">
                      <img
                        src={resume.photo_url}
                        alt="Profile"
                        className="w-full h-full object-cover"
                      />
                      <button
                        onClick={removePhoto}
                        className="absolute -top-1 -right-1 p-1 bg-destructive text-destructive-foreground rounded-full hover:bg-destructive/90"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ) : (
                    <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center border-2 border-dashed border-muted-foreground/25">
                      <User className="h-8 w-8 text-muted-foreground" />
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <Label htmlFor="photo-upload" className="cursor-pointer">
                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        disabled={uploadingPhoto}
                        onClick={() => document.getElementById('photo-upload')?.click()}
                      >
                        {uploadingPhoto ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Uploading...
                          </>
                        ) : (
                          <>
                            <Upload className="mr-2 h-4 w-4" />
                            {resume.photo_url ? 'Change Photo' : 'Upload Photo'}
                          </>
                        )}
                      </Button>
                    </div>
                  </Label>
                  <input
                    id="photo-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handlePhotoUpload}
                  />
                  <p className="text-xs text-muted-foreground mt-2">
                    JPG, PNG or WebP. Max 5MB. Square photos work best.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
              <CardDescription>Your personal and contact details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={resume.contact.name}
                    onChange={(e) => setResume({
                      ...resume,
                      contact: { ...resume.contact, name: e.target.value }
                    })}
                    placeholder="John Doe"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={resume.contact.email}
                    onChange={(e) => setResume({
                      ...resume,
                      contact: { ...resume.contact, email: e.target.value }
                    })}
                    placeholder="john@example.com"
                  />
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={resume.contact.phone}
                    onChange={(e) => setResume({
                      ...resume,
                      contact: { ...resume.contact, phone: e.target.value }
                    })}
                    placeholder="+1 (555) 000-0000"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={resume.contact.location}
                    onChange={(e) => setResume({
                      ...resume,
                      contact: { ...resume.contact, location: e.target.value }
                    })}
                    placeholder="San Francisco, CA"
                  />
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="linkedin">LinkedIn URL</Label>
                  <Input
                    id="linkedin"
                    value={resume.contact.linkedin}
                    onChange={(e) => setResume({
                      ...resume,
                      contact: { ...resume.contact, linkedin: e.target.value }
                    })}
                    placeholder="https://linkedin.com/in/johndoe"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="website">Website (Optional)</Label>
                  <Input
                    id="website"
                    value={resume.contact.website || ''}
                    onChange={(e) => setResume({
                      ...resume,
                      contact: { ...resume.contact, website: e.target.value }
                    })}
                    placeholder="https://johndoe.com"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="summary">Professional Summary</Label>
                <Textarea
                  id="summary"
                  value={resume.summary}
                  onChange={(e) => setResume({ ...resume, summary: e.target.value })}
                  placeholder="A brief summary of your professional background, key achievements, and career objectives..."
                  rows={5}
                />
                <p className="text-xs text-muted-foreground">
                  Tip: Keep your summary concise (2-4 sentences) and highlight your most relevant qualifications.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Experience Tab */}
        <TabsContent value="experience" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">Work Experience</h3>
              <p className="text-sm text-muted-foreground">Add your professional experience</p>
            </div>
            <Button onClick={addExperience}>
              <Plus className="mr-2 h-4 w-4" />
              Add Experience
            </Button>
          </div>

          {resume.experience.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Briefcase className="h-12 w-12 text-muted-foreground/50 mb-4" />
                <p className="text-muted-foreground mb-4">No experience added yet</p>
                <Button onClick={addExperience}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Your First Experience
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {resume.experience.map((exp, index) => (
                <Card key={exp.id}>
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab" />
                        <span className="text-sm font-medium text-muted-foreground">
                          Experience {index + 1}
                        </span>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:text-destructive"
                        onClick={() => removeExperience(exp.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label>Company</Label>
                        <Input
                          value={exp.company}
                          onChange={(e) => updateExperience(exp.id, 'company', e.target.value)}
                          placeholder="Company Name"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Position</Label>
                        <Input
                          value={exp.position}
                          onChange={(e) => updateExperience(exp.id, 'position', e.target.value)}
                          placeholder="Job Title"
                        />
                      </div>
                    </div>
                    <div className="grid gap-4 md:grid-cols-3">
                      <div className="space-y-2">
                        <Label>Location</Label>
                        <Input
                          value={exp.location}
                          onChange={(e) => updateExperience(exp.id, 'location', e.target.value)}
                          placeholder="City, State"
                        />
                      </div>
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
                          placeholder={exp.current ? 'Present' : ''}
                        />
                        <label className="flex items-center gap-2 text-sm">
                          <input
                            type="checkbox"
                            checked={exp.current}
                            onChange={(e) => updateExperience(exp.id, 'current', e.target.checked)}
                            className="rounded"
                          />
                          Currently working here
                        </label>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Description</Label>
                      <Textarea
                        value={exp.description}
                        onChange={(e) => updateExperience(exp.id, 'description', e.target.value)}
                        placeholder="Describe your responsibilities, achievements, and impact..."
                        rows={4}
                      />
                      <p className="text-xs text-muted-foreground">
                        Tip: Use bullet points and quantify achievements where possible.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Education Tab */}
        <TabsContent value="education" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">Education</h3>
              <p className="text-sm text-muted-foreground">Add your educational background</p>
            </div>
            <Button onClick={addEducation}>
              <Plus className="mr-2 h-4 w-4" />
              Add Education
            </Button>
          </div>

          {resume.education.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <GraduationCap className="h-12 w-12 text-muted-foreground/50 mb-4" />
                <p className="text-muted-foreground mb-4">No education added yet</p>
                <Button onClick={addEducation}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Your Education
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {resume.education.map((edu, index) => (
                <Card key={edu.id}>
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab" />
                        <span className="text-sm font-medium text-muted-foreground">
                          Education {index + 1}
                        </span>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:text-destructive"
                        onClick={() => removeEducation(edu.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label>Institution</Label>
                        <Input
                          value={edu.institution}
                          onChange={(e) => updateEducation(edu.id, 'institution', e.target.value)}
                          placeholder="University Name"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Degree</Label>
                        <Input
                          value={edu.degree}
                          onChange={(e) => updateEducation(edu.id, 'degree', e.target.value)}
                          placeholder="Bachelor's, Master's, etc."
                        />
                      </div>
                    </div>
                    <div className="grid gap-4 md:grid-cols-3">
                      <div className="space-y-2">
                        <Label>Field of Study</Label>
                        <Input
                          value={edu.field}
                          onChange={(e) => updateEducation(edu.id, 'field', e.target.value)}
                          placeholder="Computer Science"
                        />
                      </div>
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
                    </div>
                    <div className="space-y-2">
                      <Label>GPA (Optional)</Label>
                      <Input
                        value={edu.gpa}
                        onChange={(e) => updateEducation(edu.id, 'gpa', e.target.value)}
                        placeholder="3.8/4.0"
                        className="max-w-[200px]"
                      />
                    </div>
                  </CardContent>
                </Card>
              ))} 
            </div>
          )}
        </TabsContent>

        {/* Skills Tab */}
        <TabsContent value="skills" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Skills</CardTitle>
              <CardDescription>Add your technical and professional skills</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  placeholder="Add a skill (e.g., JavaScript, Project Management)"
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                />
                <Button onClick={addSkill}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              {resume.skills.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Wrench className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No skills added yet. Start typing above to add skills.</p>
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {resume.skills.map((skill) => (
                    <div
                      key={skill}
                      className="flex items-center gap-1 px-3 py-1.5 bg-primary/10 text-primary rounded-full text-sm"
                    >
                      {skill}
                      <button
                        onClick={() => removeSkill(skill)}
                        className="ml-1 hover:text-destructive"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="pt-4 border-t">
                <p className="text-sm text-muted-foreground mb-2">Suggested skills:</p>
                <div className="flex flex-wrap gap-2">
                  {['JavaScript', 'Python', 'React', 'Node.js', 'SQL', 'AWS', 'Git', 'Agile', 'Communication', 'Leadership'].map((skill) => (
                    !resume.skills.includes(skill) && (
                      <button
                        key={skill}
                        onClick={() => setResume({ ...resume, skills: [...resume.skills, skill] })}
                        className="px-3 py-1 border rounded-full text-sm text-muted-foreground hover:border-primary hover:text-primary transition-colors"
                      >
                        + {skill}
                      </button>
                    )
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Template Tab */}
        <TabsContent value="template" className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold">Choose a Template</h3>
            <p className="text-sm text-muted-foreground">Select a template that best represents your style</p>
          </div>

          <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {TEMPLATES.map((template) => {
              const isSelected = resume.template === template.id
              return (
                <button
                  key={template.id}
                  onClick={() => setResume({ ...resume, template: template.id })}
                  className={`relative rounded-lg overflow-hidden border-2 transition-all ${
                    isSelected 
                      ? 'border-primary ring-2 ring-primary/20' 
                      : 'border-transparent hover:border-muted-foreground/30'
                  }`}
                >
                  <div className={`aspect-[3/4] bg-gradient-to-br ${template.color} p-2`}>
                    <div className="bg-white rounded h-full w-full p-2 overflow-hidden">
                      <div className="h-2 w-12 bg-slate-800 rounded mx-auto mb-1" />
                      <div className="h-1 w-8 bg-slate-300 rounded mx-auto mb-2" />
                      <div className="space-y-1">
                        <div className="h-1 w-full bg-slate-200 rounded" />
                        <div className="h-1 w-3/4 bg-slate-200 rounded" />
                        <div className="h-1 w-5/6 bg-slate-200 rounded" />
                      </div>
                    </div>
                  </div>
                  {isSelected && (
                    <div className="absolute top-2 right-2 bg-primary text-primary-foreground rounded-full p-1">
                      <Check className="h-3 w-3" />
                    </div>
                  )}
                  {template.isPremium && (
                    <div className="absolute top-2 left-2">
                      <Badge className="bg-amber-500 text-xs px-1.5 py-0.5">
                        <Crown className="h-2.5 w-2.5 mr-0.5" />
                        Pro
                      </Badge>
                    </div>
                  )}
                  <div className="p-2 bg-background">
                    <p className="text-sm font-medium">{template.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{template.description}</p>
                  </div>
                </button>
              )
            })}
          </div>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Current Template: {getTemplateById(resume.template)?.name || 'Classic'}</h4>
                  <p className="text-sm text-muted-foreground">
                    {getTemplateById(resume.template)?.description || 'Traditional and timeless design'}
                  </p>
                </div>
                <Link href={`/resumes/${resumeId}/preview`}>
                  <Button variant="outline">
                    <Eye className="h-4 w-4 mr-2" />
                    Preview with Template
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Share Tab */}
        <TabsContent value="share" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Share2 className="h-5 w-5" />
                Share Your Resume
              </CardTitle>
              <CardDescription>
                Generate a public link and QR code to share your resume with anyone
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {!publicSlug ? (
                <div className="text-center py-8">
                  <div className="p-4 bg-muted rounded-full w-fit mx-auto mb-4">
                    <ExternalLink className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Create a Public Link</h3>
                  <p className="text-muted-foreground mb-4 max-w-md mx-auto">
                    Generate a shareable link that anyone can use to view your resume without logging in.
                  </p>
                  <Button onClick={createPublicLink} disabled={creatingLink}>
                    {creatingLink ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      <>
                        <Share2 className="mr-2 h-4 w-4" />
                        Create Share Link
                      </>
                    )}
                  </Button>
                </div>
              ) : (
                <>
                  <div className="flex flex-col md:flex-row gap-6">
                    {/* QR Code */}
                    <div className="flex flex-col items-center">
                      <div className="p-4 bg-white rounded-xl shadow-lg border">
                        <QRCodeSVG
                          value={getShareableLink()}
                          size={180}
                          level="H"
                          includeMargin={true}
                        />
                      </div>
                      <p className="text-sm text-muted-foreground mt-3 text-center">
                        Scan to view resume
                      </p>
                    </div>

                    {/* Link & Actions */}
                    <div className="flex-1 space-y-4">
                      <div>
                        <Label>Public Link</Label>
                        <div className="flex gap-2 mt-1">
                          <Input
                            readOnly
                            value={getShareableLink()}
                            className="flex-1 bg-muted"
                          />
                          <Button onClick={handleCopyLink} variant="secondary">
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <Button variant="outline" onClick={() => window.open(getShareableLink(), '_blank')}>
                          <ExternalLink className="mr-2 h-4 w-4" />
                          Open Link
                        </Button>
                        <Button variant="outline" onClick={handleCopyLink}>
                          <Copy className="mr-2 h-4 w-4" />
                          Copy Link
                        </Button>
                      </div>

                      <div className="pt-4 border-t">
                        <p className="text-sm text-muted-foreground">
                          <strong>Tip:</strong> Anyone with this link can view your resume. 
                          The link will remain active until you delete it.
                        </p>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Bottom Save Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur border-t p-4 flex justify-end gap-4 md:left-64">
        <Button variant="outline" onClick={() => router.push('/resumes')}>
          Cancel
        </Button>
        <Button onClick={saveResume} disabled={saving}>
          {saving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Save Changes
            </>
          )}
        </Button>
      </div>

      {/* Spacer for fixed bottom bar */}
      <div className="h-20" />
    </div>
  )
}
