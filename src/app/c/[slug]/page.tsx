import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { Mail, Phone, Globe, Linkedin, Github, Twitter } from 'lucide-react'
import { CardTemplate } from '@/components/card-templates'
import type { CardData } from '@/components/card-templates/types'
import type { Metadata } from 'next'

interface PageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const supabase = await createClient()
  
  const { data: card } = await supabase
    .from('visiting_cards')
    .select('name, title, company')
    .eq('public_slug', slug)
    .single()

  if (!card) {
    return {
      title: 'Card Not Found',
      robots: { index: false, follow: false }
    }
  }

  const title = card.title ? `${card.title} at ${card.company || 'Unknown'}` : 'Digital Business Card'

  return {
    title: `${card.name} - ${title} | Resume Unleashed`,
    description: `Connect with ${card.name}. View digital business card and contact information.`,
    robots: {
      index: true,
      follow: true,
    },
    openGraph: {
      title: `${card.name} - Digital Business Card`,
      description: `View ${card.name}'s digital visiting card.`,
      type: 'profile',
    },
  }
}

export default async function PublicCardPage({ params }: PageProps) {
  const { slug } = await params
  const supabase = await createClient()
  
  const { data: card, error } = await supabase
    .from('visiting_cards')
    .select('*')
    .eq('public_slug', slug)
    .single()

  if (error || !card) {
    notFound()
  }

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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col items-center justify-center p-4">
      {/* Card Preview */}
      <div className="mb-8">
        <CardTemplate 
          templateId={card.template_id || 'classic-card'} 
          data={cardData} 
          showQR={false}
        />
      </div>

      {/* Contact Actions */}
      <div className="w-full max-w-md space-y-3">
        {card.email && (
          <a 
            href={`mailto:${card.email}`}
            className="flex items-center gap-3 p-4 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
              <Mail className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Email</p>
              <p className="font-medium">{card.email}</p>
            </div>
          </a>
        )}

        {card.phone && (
          <a 
            href={`tel:${card.phone}`}
            className="flex items-center gap-3 p-4 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
              <Phone className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Phone</p>
              <p className="font-medium">{card.phone}</p>
            </div>
          </a>
        )}

        {card.website && (
          <a 
            href={card.website.startsWith('http') ? card.website : `https://${card.website}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 p-4 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
              <Globe className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Website</p>
              <p className="font-medium">{card.website}</p>
            </div>
          </a>
        )}

        {card.linkedin && (
          <a 
            href={card.linkedin.startsWith('http') ? card.linkedin : `https://${card.linkedin}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 p-4 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
              <Linkedin className="h-5 w-5 text-blue-700" />
            </div>
            <div>
              <p className="text-sm text-gray-500">LinkedIn</p>
              <p className="font-medium">View Profile</p>
            </div>
          </a>
        )}

        {card.github && (
          <a 
            href={card.github.startsWith('http') ? card.github : `https://${card.github}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 p-4 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
              <Github className="h-5 w-5 text-gray-800" />
            </div>
            <div>
              <p className="text-sm text-gray-500">GitHub</p>
              <p className="font-medium">View Profile</p>
            </div>
          </a>
        )}
      </div>

      {/* Footer */}
      <p className="mt-8 text-sm text-gray-400">
        Created with Resume Builder
      </p>
    </div>
  )
}
