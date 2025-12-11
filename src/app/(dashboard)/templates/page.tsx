import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Crown, FileText, CreditCard, Check, Eye } from 'lucide-react'
import Link from 'next/link'

// Static templates data (can be moved to database later)
const RESUME_TEMPLATES = [
  {
    id: 'modern',
    name: 'Modern',
    slug: 'modern',
    description: 'Clean and contemporary design with a focus on readability',
    is_premium: false,
    color: 'from-teal-500 to-cyan-500',
  },
  {
    id: 'professional',
    name: 'Professional',
    slug: 'professional',
    description: 'Traditional layout perfect for corporate roles',
    is_premium: false,
    color: 'from-blue-500 to-indigo-500',
  },
  {
    id: 'creative',
    name: 'Creative',
    slug: 'creative',
    description: 'Stand out with a unique and artistic design',
    is_premium: false,
    color: 'from-purple-500 to-pink-500',
  },
  {
    id: 'minimal',
    name: 'Minimal',
    slug: 'minimal',
    description: 'Simple and elegant with maximum white space',
    is_premium: false,
    color: 'from-slate-500 to-slate-700',
  },
  {
    id: 'executive',
    name: 'Executive',
    slug: 'executive',
    description: 'Sophisticated design for senior positions',
    is_premium: true,
    color: 'from-amber-500 to-orange-500',
  },
  {
    id: 'tech',
    name: 'Tech',
    slug: 'tech',
    description: 'Optimized for software and tech industry roles',
    is_premium: true,
    color: 'from-green-500 to-emerald-500',
  },
]

const CARD_TEMPLATES = [
  {
    id: 'classic',
    name: 'Classic',
    slug: 'classic',
    description: 'Timeless business card design',
    is_premium: false,
    color: 'from-slate-600 to-slate-800',
  },
  {
    id: 'gradient',
    name: 'Gradient',
    slug: 'gradient',
    description: 'Modern gradient background',
    is_premium: false,
    color: 'from-violet-500 to-purple-600',
  },
  {
    id: 'minimal-card',
    name: 'Minimal',
    slug: 'minimal-card',
    description: 'Clean and simple',
    is_premium: false,
    color: 'from-gray-100 to-gray-200',
  },
  {
    id: 'bold',
    name: 'Bold',
    slug: 'bold',
    description: 'Make a statement',
    is_premium: true,
    color: 'from-red-500 to-rose-600',
  },
]

export default function TemplatesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Templates</h1>
        <p className="text-muted-foreground mt-1">
          Choose from our collection of professional templates
        </p>
      </div>

      <Tabs defaultValue="resumes" className="space-y-6">
        <TabsList>
          <TabsTrigger value="resumes" className="gap-2">
            <FileText className="h-4 w-4" />
            Resume Templates
          </TabsTrigger>
          <TabsTrigger value="cards" className="gap-2">
            <CreditCard className="h-4 w-4" />
            Card Templates
          </TabsTrigger>
        </TabsList>

        <TabsContent value="resumes" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {RESUME_TEMPLATES.map((template) => (
              <Card key={template.id} className="group overflow-hidden hover:shadow-lg transition-shadow">
                <div className={`aspect-[3/4] bg-gradient-to-br ${template.color} relative`}>
                  {/* Template Preview */}
                  <div className="absolute inset-4 bg-white rounded-lg shadow-lg p-4 transform group-hover:scale-[1.02] transition-transform">
                    {/* Header */}
                    <div className="text-center border-b pb-3 mb-3">
                      <div className="h-4 w-28 bg-slate-800 rounded mx-auto mb-2" />
                      <div className="flex justify-center gap-2">
                        <div className="h-2 w-16 bg-slate-300 rounded" />
                        <div className="h-2 w-16 bg-slate-300 rounded" />
                      </div>
                    </div>
                    {/* Summary */}
                    <div className="mb-3">
                      <div className="h-2.5 w-20 bg-slate-700 rounded mb-2" />
                      <div className="space-y-1">
                        <div className="h-1.5 w-full bg-slate-200 rounded" />
                        <div className="h-1.5 w-5/6 bg-slate-200 rounded" />
                      </div>
                    </div>
                    {/* Experience */}
                    <div className="mb-3">
                      <div className="h-2.5 w-24 bg-slate-700 rounded mb-2" />
                      <div className="space-y-2">
                        <div>
                          <div className="h-2 w-32 bg-slate-400 rounded mb-1" />
                          <div className="h-1.5 w-full bg-slate-200 rounded" />
                        </div>
                        <div>
                          <div className="h-2 w-28 bg-slate-400 rounded mb-1" />
                          <div className="h-1.5 w-4/5 bg-slate-200 rounded" />
                        </div>
                      </div>
                    </div>
                    {/* Skills */}
                    <div>
                      <div className="h-2.5 w-16 bg-slate-700 rounded mb-2" />
                      <div className="flex flex-wrap gap-1">
                        <div className="h-4 w-12 bg-slate-100 rounded-full" />
                        <div className="h-4 w-14 bg-slate-100 rounded-full" />
                        <div className="h-4 w-10 bg-slate-100 rounded-full" />
                      </div>
                    </div>
                  </div>
                  {template.is_premium && (
                    <div className="absolute top-2 right-2">
                      <Badge className="bg-amber-500 hover:bg-amber-600">
                        <Crown className="h-3 w-3 mr-1" />
                        Premium
                      </Badge>
                    </div>
                  )}
                  {/* Hover overlay */}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Button variant="secondary" size="sm">
                      <Eye className="h-4 w-4 mr-2" />
                      Preview
                    </Button>
                  </div>
                </div>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{template.name}</CardTitle>
                    {!template.is_premium && (
                      <Badge variant="outline" className="text-green-600 border-green-600">
                        <Check className="h-3 w-3 mr-1" />
                        Free
                      </Badge>
                    )}
                  </div>
                  <CardDescription>{template.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Link href={`/resumes/new?template=${template.slug}`}>
                    <Button className="w-full" variant={template.is_premium ? 'secondary' : 'default'}>
                      {template.is_premium ? 'Unlock Premium' : 'Use Template'}
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="cards" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {CARD_TEMPLATES.map((template) => (
              <Card key={template.id} className="group overflow-hidden hover:shadow-lg transition-shadow">
                <div className={`aspect-[1.75/1] bg-gradient-to-br ${template.color} relative`}>
                  {/* Card Preview */}
                  <div className="absolute inset-3 bg-white rounded shadow-lg p-3 flex flex-col justify-between transform group-hover:scale-[1.02] transition-transform">
                    <div>
                      <div className="h-3 w-20 bg-slate-800 rounded mb-1" />
                      <div className="h-2 w-16 bg-slate-400 rounded" />
                    </div>
                    <div className="space-y-1">
                      <div className="h-1.5 w-24 bg-slate-300 rounded" />
                      <div className="h-1.5 w-20 bg-slate-300 rounded" />
                    </div>
                  </div>
                  {template.is_premium && (
                    <div className="absolute top-2 right-2">
                      <Badge className="bg-amber-500 hover:bg-amber-600 text-xs">
                        <Crown className="h-2.5 w-2.5 mr-0.5" />
                        Pro
                      </Badge>
                    </div>
                  )}
                </div>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">{template.name}</CardTitle>
                  <CardDescription className="text-xs">{template.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Link href={`/cards/new?template=${template.slug}`}>
                    <Button size="sm" className="w-full" variant={template.is_premium ? 'secondary' : 'default'}>
                      {template.is_premium ? 'Unlock' : 'Use'}
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
