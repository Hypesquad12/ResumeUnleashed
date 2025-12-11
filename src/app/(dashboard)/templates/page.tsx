import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Crown, FileText, CreditCard, Check, Eye, Briefcase, Palette, Sparkles, Building } from 'lucide-react'
import Link from 'next/link'
import { TEMPLATES } from '@/components/templates/types'
import { TemplateThumbnail } from '@/components/templates/template-thumbnail'

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
    id: 'bold-card',
    name: 'Bold',
    slug: 'bold-card',
    description: 'Make a statement',
    is_premium: true,
    color: 'from-red-500 to-rose-600',
  },
]

const categoryIcons = {
  professional: Briefcase,
  creative: Palette,
  modern: Sparkles,
  minimal: FileText,
  executive: Building,
}

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
          {/* Category filters */}
          <div className="flex flex-wrap gap-2">
            {(['all', 'professional', 'modern', 'creative', 'minimal', 'executive'] as const).map((cat) => {
              const Icon = cat === 'all' ? FileText : categoryIcons[cat as keyof typeof categoryIcons]
              return (
                <Badge 
                  key={cat} 
                  variant="outline" 
                  className="px-3 py-1 cursor-pointer hover:bg-accent capitalize"
                >
                  <Icon className="h-3 w-3 mr-1" />
                  {cat}
                </Badge>
              )
            })}
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {TEMPLATES.map((template) => {
              const CategoryIcon = categoryIcons[template.category]
              return (
                <Card key={template.id} className="group overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                  <div className={`aspect-[3/4] bg-gradient-to-br ${template.color} relative p-3`}>
                    {/* Template Preview - Using actual template thumbnail */}
                    <div className="absolute inset-3 rounded-lg shadow-xl overflow-hidden transform group-hover:scale-[1.02] transition-transform">
                      <TemplateThumbnail templateId={template.id} />
                    </div>
                    {template.isPremium && (
                      <div className="absolute top-1 right-1 z-10">
                        <Badge className="bg-amber-500 hover:bg-amber-600 shadow-lg">
                          <Crown className="h-3 w-3 mr-1" />
                          Pro
                        </Badge>
                      </div>
                    )}
                    {/* Category badge */}
                    <div className="absolute top-1 left-1 z-10">
                      <Badge variant="secondary" className="text-xs capitalize shadow-lg bg-white/90">
                        <CategoryIcon className="h-2.5 w-2.5 mr-1" />
                        {template.category}
                      </Badge>
                    </div>
                    {/* Hover overlay */}
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <Link href={`/templates/${template.id}/preview`}>
                        <Button variant="secondary" size="sm" className="shadow-lg">
                          <Eye className="h-4 w-4 mr-1" />
                          Preview
                        </Button>
                      </Link>
                    </div>
                  </div>
                  <CardHeader className="pb-2 pt-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">{template.name}</CardTitle>
                      {!template.isPremium && (
                        <Badge variant="outline" className="text-green-600 border-green-600 text-xs">
                          <Check className="h-2.5 w-2.5 mr-0.5" />
                          Free
                        </Badge>
                      )}
                    </div>
                    <CardDescription className="text-xs">{template.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <Link href={`/resumes/new?template=${template.id}`}>
                      <Button className="w-full" size="sm" variant={template.isPremium ? 'secondary' : 'default'}>
                        {template.isPremium ? 'Unlock Premium' : 'Use Template'}
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              )
            })}
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
