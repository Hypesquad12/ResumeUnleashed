'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ArrowLeft, Loader2, QrCode, FileText } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'

const themeColors = [
  { name: 'Navy', value: '#1a1a2e' },
  { name: 'Forest', value: '#1b4332' },
  { name: 'Wine', value: '#722f37' },
  { name: 'Slate', value: '#334155' },
  { name: 'Purple', value: '#4c1d95' },
  { name: 'Black', value: '#0a0a0a' },
]

export default function NewCardPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [loadingResume, setLoadingResume] = useState(true)
  const [hasResume, setHasResume] = useState(false)
  
  const [formData, setFormData] = useState({
    name: '',
    title: '',
    company: '',
    email: '',
    phone: '',
    website: '',
    linkedin: '',
    github: '',
    theme_color: '#1a1a2e',
  })

  // Auto-populate from resume if available
  useEffect(() => {
    const loadResumeData = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        setLoadingResume(false)
        return
      }

      // Get the most recent resume
      const { data: resume } = await supabase
        .from('resumes')
        .select('contact, experience')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      if (resume) {
        setHasResume(true)
        const contact = resume.contact as Record<string, string> | null
        const experience = resume.experience as Array<{ company?: string; position?: string }> | null
        
        // Get most recent job for title and company
        const latestJob = experience?.[0]
        
        setFormData(prev => ({
          ...prev,
          name: contact?.name || prev.name,
          email: contact?.email || prev.email,
          phone: contact?.phone || prev.phone,
          website: contact?.website || prev.website,
          linkedin: contact?.linkedin || prev.linkedin,
          title: latestJob?.position || prev.title,
          company: latestJob?.company || prev.company,
        }))
        
        toast.success('Auto-filled from your resume!', {
          description: 'We found your resume and pre-filled your details.',
          icon: <FileText className="h-4 w-4" />,
        })
      }
      
      setLoadingResume(false)
    }

    loadResumeData()
  }, [])

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleCreate = async () => {
    if (!formData.name) {
      toast.error('Please enter your name')
      return
    }

    setLoading(true)
    const supabase = createClient()
    
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      toast.error('Please login to create a card')
      router.push('/login')
      return
    }

    // Generate a unique slug
    const slug = formData.name.toLowerCase().replace(/\s+/g, '-') + '-' + Math.random().toString(36).substring(2, 7)

    const { data, error } = await supabase
      .from('visiting_cards')
      .insert({
        user_id: user.id,
        ...formData,
        public_slug: slug,
      })
      .select()
      .single()

    if (error) {
      toast.error('Failed to create card')
      setLoading(false)
      return
    }

    toast.success('Card created successfully!')
    router.push(`/cards/${data.id}`)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/cards">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Create Visiting Card</h1>
          <p className="text-muted-foreground mt-1">
            Design your digital business card
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Form */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>Your basic contact details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleChange('name', e.target.value)}
                    placeholder="John Doe"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="title">Job Title</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => handleChange('title', e.target.value)}
                    placeholder="Software Engineer"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="company">Company</Label>
                <Input
                  id="company"
                  value={formData.company}
                  onChange={(e) => handleChange('company', e.target.value)}
                  placeholder="Acme Inc."
                />
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                    placeholder="john@example.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => handleChange('phone', e.target.value)}
                    placeholder="+1 (555) 000-0000"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Social Links</CardTitle>
              <CardDescription>Your online presence</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="website">Website</Label>
                <Input
                  id="website"
                  value={formData.website}
                  onChange={(e) => handleChange('website', e.target.value)}
                  placeholder="https://johndoe.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="linkedin">LinkedIn</Label>
                <Input
                  id="linkedin"
                  value={formData.linkedin}
                  onChange={(e) => handleChange('linkedin', e.target.value)}
                  placeholder="https://linkedin.com/in/johndoe"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="github">GitHub</Label>
                <Input
                  id="github"
                  value={formData.github}
                  onChange={(e) => handleChange('github', e.target.value)}
                  placeholder="https://github.com/johndoe"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Theme Color</CardTitle>
              <CardDescription>Choose your card&apos;s background color</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-3">
                {themeColors.map((color) => (
                  <button
                    key={color.value}
                    onClick={() => handleChange('theme_color', color.value)}
                    className={`w-10 h-10 rounded-lg transition-all ${
                      formData.theme_color === color.value
                        ? 'ring-2 ring-primary ring-offset-2'
                        : 'hover:scale-110'
                    }`}
                    style={{ backgroundColor: color.value }}
                    title={color.name}
                  />
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-4">
            <Link href="/cards">
              <Button variant="outline">Cancel</Button>
            </Link>
            <Button onClick={handleCreate} disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Card'
              )}
            </Button>
          </div>
        </div>

        {/* Preview */}
        <div className="lg:sticky lg:top-6">
          <Card>
            <CardHeader>
              <CardTitle>Preview</CardTitle>
              <CardDescription>How your card will look</CardDescription>
            </CardHeader>
            <CardContent>
              <div 
                className="aspect-[1.75/1] rounded-xl p-6 flex flex-col justify-between text-white shadow-xl"
                style={{ backgroundColor: formData.theme_color }}
              >
                <div>
                  <h3 className="text-2xl font-bold">{formData.name || 'Your Name'}</h3>
                  {formData.title && <p className="text-white/80">{formData.title}</p>}
                  {formData.company && <p className="text-white/60 text-sm mt-1">{formData.company}</p>}
                </div>
                <div className="flex justify-between items-end">
                  <div className="text-white/80 text-sm space-y-0.5">
                    {formData.email && <p>{formData.email}</p>}
                    {formData.phone && <p>{formData.phone}</p>}
                    {formData.website && <p>{formData.website}</p>}
                  </div>
                  <div className="w-16 h-16 bg-white rounded-lg p-2 flex items-center justify-center">
                    <QrCode className="w-full h-full text-slate-900" />
                  </div>
                </div>
              </div>
              <p className="text-sm text-muted-foreground mt-4 text-center">
                QR code will be generated after creating the card
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
