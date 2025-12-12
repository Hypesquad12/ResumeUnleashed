'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { 
  ArrowLeft, Loader2, Download, Share2, Copy, ExternalLink, 
  Mail, Phone, Globe, Linkedin, Github, Edit, Trash2, Save, X
} from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'
import { QRCodeSVG } from 'qrcode.react'
import { CardTemplate, CARD_TEMPLATES, getCardTemplateById } from '@/components/card-templates'
import type { CardData } from '@/components/card-templates/types'

interface VisitingCard {
  id: string
  name: string
  title: string | null
  company: string | null
  email: string | null
  phone: string | null
  website: string | null
  linkedin: string | null
  github: string | null
  twitter: string | null
  theme_color: string | null
  public_slug: string | null
  template_id: string | null
  created_at: string | null
}

export default function CardDetailPage() {
  const router = useRouter()
  const params = useParams()
  const cardId = params.id as string
  
  const [loading, setLoading] = useState(true)
  const [card, setCard] = useState<VisitingCard | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [editForm, setEditForm] = useState({
    name: '',
    title: '',
    company: '',
    email: '',
    phone: '',
    website: '',
    linkedin: '',
    github: '',
  })

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    loadCard()
  }, [cardId])

  const loadCard = async () => {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('visiting_cards')
      .select('*')
      .eq('id', cardId)
      .single()

    if (error || !data) {
      toast.error('Card not found')
      router.push('/cards')
      return
    }

    setCard(data)
    setEditForm({
      name: data.name || '',
      title: data.title || '',
      company: data.company || '',
      email: data.email || '',
      phone: data.phone || '',
      website: data.website || '',
      linkedin: data.linkedin || '',
      github: data.github || '',
    })
    setLoading(false)
  }

  const startEditing = () => {
    if (card) {
      setEditForm({
        name: card.name || '',
        title: card.title || '',
        company: card.company || '',
        email: card.email || '',
        phone: card.phone || '',
        website: card.website || '',
        linkedin: card.linkedin || '',
        github: card.github || '',
      })
      setIsEditing(true)
    }
  }

  const cancelEditing = () => {
    setIsEditing(false)
  }

  const saveChanges = async () => {
    if (!editForm.name.trim()) {
      toast.error('Name is required')
      return
    }

    setSaving(true)
    const supabase = createClient()
    const { error } = await supabase
      .from('visiting_cards')
      .update({
        name: editForm.name,
        title: editForm.title || null,
        company: editForm.company || null,
        email: editForm.email || null,
        phone: editForm.phone || null,
        website: editForm.website || null,
        linkedin: editForm.linkedin || null,
        github: editForm.github || null,
      })
      .eq('id', cardId)

    if (error) {
      toast.error('Failed to save changes')
      setSaving(false)
      return
    }

    // Update local state
    setCard(prev => prev ? { ...prev, ...editForm } : prev)
    setIsEditing(false)
    setSaving(false)
    toast.success('Card updated successfully')
  }

  const getShareableLink = () => {
    const origin = mounted ? window.location.origin : 'https://example.com'
    if (!card?.public_slug) return `${origin}/c/preview`
    return `${origin}/c/${card.public_slug}`
  }

  const handleCopyLink = async () => {
    const link = getShareableLink()
    await navigator.clipboard.writeText(link)
    toast.success('Link copied to clipboard!')
  }

  const handleShare = async () => {
    const link = getShareableLink()
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${card?.name}'s Card`,
          url: link,
        })
      } catch {
        // User cancelled
      }
    } else {
      handleCopyLink()
    }
  }

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this card?')) return
    
    setDeleting(true)
    const supabase = createClient()
    const { error } = await supabase
      .from('visiting_cards')
      .delete()
      .eq('id', cardId)

    if (error) {
      toast.error('Failed to delete card')
      setDeleting(false)
      return
    }

    toast.success('Card deleted')
    router.push('/cards')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!card) return null

  const cardData: CardData = {
    name: card.name,
    title: card.title || undefined,
    company: card.company || undefined,
    email: card.email || undefined,
    phone: card.phone || undefined,
    website: card.website || undefined,
    linkedin: card.linkedin || undefined,
    github: card.github || undefined,
    twitter: card.twitter || undefined,
    theme_color: card.theme_color || '#1a1a2e',
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <Link href="/cards">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">{card.name}&apos;s Card</h1>
            <p className="text-sm text-muted-foreground">
              Created {new Date(card.created_at || Date.now()).toLocaleDateString()}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isEditing ? (
            <>
              <Button variant="outline" onClick={cancelEditing} disabled={saving}>
                <X className="mr-2 h-4 w-4" />
                Cancel
              </Button>
              <Button onClick={saveChanges} disabled={saving}>
                {saving ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Save className="mr-2 h-4 w-4" />
                )}
                Save
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" onClick={startEditing}>
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </Button>
              <Button variant="outline" onClick={handleShare}>
                <Share2 className="mr-2 h-4 w-4" />
                Share
              </Button>
              <Button variant="outline" onClick={handleDelete} disabled={deleting}>
                {deleting ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="mr-2 h-4 w-4" />
                )}
                Delete
              </Button>
            </>
          )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Card Preview */}
        <Card>
          <CardHeader>
            <CardTitle>Card Preview</CardTitle>
            <CardDescription>How your card looks</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <CardTemplate 
              templateId={card.template_id || 'classic-card'} 
              data={cardData} 
              showQR={true}
            />
          </CardContent>
        </Card>

        {/* QR Code & Share */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>QR Code</CardTitle>
              <CardDescription>Scan to view your digital card</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center">
              <div className="p-4 bg-white rounded-xl shadow-lg">
                <QRCodeSVG 
                  value={getShareableLink()} 
                  size={180}
                  level="H"
                  includeMargin={true}
                />
              </div>
              <p className="text-sm text-muted-foreground mt-4 text-center">
                Share this QR code to let others view your card
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ExternalLink className="h-5 w-5" />
                Share Link
              </CardTitle>
              <CardDescription>Share your card with anyone</CardDescription>
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

          {/* Contact Details / Edit Form */}
          <Card>
            <CardHeader>
              <CardTitle>{isEditing ? 'Edit Card Details' : 'Contact Details'}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {isEditing ? (
                <>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="name">Name *</Label>
                      <Input
                        id="name"
                        value={editForm.name}
                        onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                        placeholder="Your name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="title">Job Title</Label>
                      <Input
                        id="title"
                        value={editForm.title}
                        onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                        placeholder="e.g. Software Engineer"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="company">Company</Label>
                    <Input
                      id="company"
                      value={editForm.company}
                      onChange={(e) => setEditForm({ ...editForm, company: e.target.value })}
                      placeholder="Your company"
                    />
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={editForm.email}
                        onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                        placeholder="you@example.com"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone</Label>
                      <Input
                        id="phone"
                        value={editForm.phone}
                        onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                        placeholder="+1 (555) 000-0000"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="website">Website</Label>
                    <Input
                      id="website"
                      value={editForm.website}
                      onChange={(e) => setEditForm({ ...editForm, website: e.target.value })}
                      placeholder="https://yourwebsite.com"
                    />
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="linkedin">LinkedIn</Label>
                      <Input
                        id="linkedin"
                        value={editForm.linkedin}
                        onChange={(e) => setEditForm({ ...editForm, linkedin: e.target.value })}
                        placeholder="linkedin.com/in/username"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="github">GitHub</Label>
                      <Input
                        id="github"
                        value={editForm.github}
                        onChange={(e) => setEditForm({ ...editForm, github: e.target.value })}
                        placeholder="github.com/username"
                      />
                    </div>
                  </div>
                </>
              ) : (
                <div className="space-y-3">
                  {card.email && (
                    <div className="flex items-center gap-3 text-sm">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span>{card.email}</span>
                    </div>
                  )}
                  {card.phone && (
                    <div className="flex items-center gap-3 text-sm">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span>{card.phone}</span>
                    </div>
                  )}
                  {card.website && (
                    <div className="flex items-center gap-3 text-sm">
                      <Globe className="h-4 w-4 text-muted-foreground" />
                      <span>{card.website}</span>
                    </div>
                  )}
                  {card.linkedin && (
                    <div className="flex items-center gap-3 text-sm">
                      <Linkedin className="h-4 w-4 text-muted-foreground" />
                      <span>{card.linkedin}</span>
                    </div>
                  )}
                  {card.github && (
                    <div className="flex items-center gap-3 text-sm">
                      <Github className="h-4 w-4 text-muted-foreground" />
                      <span>{card.github}</span>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
