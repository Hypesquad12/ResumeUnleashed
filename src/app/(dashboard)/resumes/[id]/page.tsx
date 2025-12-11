'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  ArrowLeft, Save, Loader2, Plus, Trash2, GripVertical,
  User, Briefcase, GraduationCap, Wrench, FileText, Eye, Sparkles
} from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'

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
}

const defaultContact: ContactInfo = {
  name: '',
  email: '',
  phone: '',
  linkedin: '',
  location: '',
  website: '',
}

export default function ResumeEditorPage() {
  const router = useRouter()
  const params = useParams()
  const resumeId = params.id as string
  
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [resume, setResume] = useState<ResumeData | null>(null)
  const [activeTab, setActiveTab] = useState('contact')
  const [newSkill, setNewSkill] = useState('')

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

    setResume({
      id: data.id,
      title: data.title || 'Untitled Resume',
      contact,
      summary: data.summary || '',
      experience,
      education,
      skills,
    })
    setLoading(false)
  }

  const saveResume = async () => {
    if (!resume) return
    setSaving(true)

    const supabase = createClient()
    const { error } = await supabase
      .from('resumes')
      .update({
        title: resume.title,
        contact: resume.contact,
        summary: resume.summary,
        experience: resume.experience,
        education: resume.education,
        skills: resume.skills,
        updated_at: new Date().toISOString(),
      })
      .eq('id', resumeId)

    if (error) {
      toast.error('Failed to save resume')
    } else {
      toast.success('Resume saved successfully')
    }
    setSaving(false)
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
        <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-grid">
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
        </TabsList>

        {/* Contact Tab */}
        <TabsContent value="contact" className="space-y-6">
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
