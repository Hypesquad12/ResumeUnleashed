'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { FileText, Upload, ArrowLeft, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'

export default function NewResumePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState<'choose' | 'manual' | 'upload'>('choose')
  
  // Form state
  const [title, setTitle] = useState('My Resume')
  const [contact, setContact] = useState({
    name: '',
    email: '',
    phone: '',
    linkedin: '',
    location: '',
  })
  const [summary, setSummary] = useState('')

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
        contact,
        summary,
        experience: [],
        education: [],
        skills: [],
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

  if (step === 'choose') {
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
            onClick={() => setStep('manual')}
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
            onClick={() => setStep('upload')}
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

  if (step === 'upload') {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => setStep('choose')}>
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
            <div className="border-2 border-dashed rounded-lg p-12 text-center">
              <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Drop your resume here</h3>
              <p className="text-muted-foreground mb-4">
                Supports PDF and DOCX files up to 10MB
              </p>
              <Button>
                <Upload className="mr-2 h-4 w-4" />
                Browse Files
              </Button>
            </div>
            <p className="text-sm text-muted-foreground mt-4 text-center">
              Your resume will be parsed using AI to extract all relevant information
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => setStep('choose')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Create Resume</h1>
          <p className="text-muted-foreground mt-1">
            Fill in your basic information to get started
          </p>
        </div>
      </div>

      <div className="max-w-2xl space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
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
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  value={contact.name}
                  onChange={(e) => setContact({ ...contact, name: e.target.value })}
                  placeholder="John Doe"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
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

        <div className="flex justify-end gap-4">
          <Button variant="outline" onClick={() => setStep('choose')}>
            Cancel
          </Button>
          <Button onClick={handleCreateResume} disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              'Create Resume'
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
