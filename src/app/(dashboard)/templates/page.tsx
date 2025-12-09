import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Crown, FileText, CreditCard } from 'lucide-react'

export default async function TemplatesPage() {
  const supabase = await createClient()
  
  const { data: templates } = await supabase
    .from('resume_templates')
    .select('*')
    .eq('is_active', true)
    .order('name')

  const resumeTemplates = templates?.filter(t => t.template_type === 'resume') || []
  const cardTemplates = templates?.filter(t => t.template_type === 'card') || []

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
            {resumeTemplates.map((template) => (
              <Card key={template.id} className="group overflow-hidden">
                <div className="aspect-[3/4] bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900 relative">
                  {/* Template Preview Placeholder */}
                  <div className="absolute inset-4 bg-white dark:bg-slate-950 rounded shadow-sm p-4">
                    <div className="h-4 w-24 bg-slate-200 dark:bg-slate-800 rounded mb-2" />
                    <div className="h-2 w-32 bg-slate-100 dark:bg-slate-800 rounded mb-4" />
                    <div className="space-y-2">
                      <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded" />
                      <div className="h-2 w-3/4 bg-slate-100 dark:bg-slate-800 rounded" />
                      <div className="h-2 w-5/6 bg-slate-100 dark:bg-slate-800 rounded" />
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
                </div>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">{template.name}</CardTitle>
                  <CardDescription>{template.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className="w-full" variant={template.is_premium ? 'secondary' : 'default'}>
                    {template.is_premium ? 'Unlock Premium' : 'Use Template'}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="cards" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {cardTemplates.map((template) => (
              <Card key={template.id} className="group overflow-hidden">
                <div className="aspect-[1.75/1] bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900 relative">
                  {/* Card Preview Placeholder */}
                  <div className="absolute inset-3 bg-white dark:bg-slate-950 rounded shadow-sm p-3 flex flex-col justify-between">
                    <div>
                      <div className="h-3 w-20 bg-slate-200 dark:bg-slate-800 rounded mb-1" />
                      <div className="h-2 w-16 bg-slate-100 dark:bg-slate-800 rounded" />
                    </div>
                    <div className="space-y-1">
                      <div className="h-1.5 w-24 bg-slate-100 dark:bg-slate-800 rounded" />
                      <div className="h-1.5 w-20 bg-slate-100 dark:bg-slate-800 rounded" />
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
                  <Button size="sm" className="w-full" variant={template.is_premium ? 'secondary' : 'default'}>
                    {template.is_premium ? 'Unlock' : 'Use'}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
