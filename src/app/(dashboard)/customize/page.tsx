import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Sparkles, FileText, Link as LinkIcon, ArrowRight } from 'lucide-react'
import Link from 'next/link'

export default async function CustomizePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  const { data: resumes } = await supabase
    .from('resumes')
    .select('*')
    .eq('user_id', user!.id)
    .order('created_at', { ascending: false })

  const hasResumes = resumes && resumes.length > 0

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">AI Customize</h1>
        <p className="text-muted-foreground mt-1">
          Tailor your resume for specific job descriptions using AI
        </p>
      </div>

      {!hasResumes ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="p-4 bg-muted rounded-full mb-4">
              <FileText className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No resumes to customize</h3>
            <p className="text-muted-foreground text-center mb-4 max-w-sm">
              Create a resume first, then come back here to customize it for specific jobs.
            </p>
            <Link href="/resumes/new">
              <Button>Create Resume First</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Step 1: Select Resume */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm font-bold">
                  1
                </div>
                <CardTitle>Select Resume</CardTitle>
              </div>
              <CardDescription>
                Choose the resume you want to customize
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {resumes?.slice(0, 5).map((resume) => (
                <div
                  key={resume.id}
                  className="flex items-center justify-between p-3 rounded-lg border hover:bg-accent cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{resume.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(resume.updated_at || resume.created_at!).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm">Select</Button>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Step 2: Add Job Description */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-muted text-muted-foreground text-sm font-bold">
                  2
                </div>
                <CardTitle>Add Job Description</CardTitle>
              </div>
              <CardDescription>
                Paste the job description or provide a URL
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <Card className="cursor-pointer hover:border-primary transition-colors">
                  <CardContent className="pt-6 text-center">
                    <FileText className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                    <p className="font-medium">Paste Text</p>
                    <p className="text-sm text-muted-foreground">
                      Copy & paste job description
                    </p>
                  </CardContent>
                </Card>
                <Card className="cursor-pointer hover:border-primary transition-colors">
                  <CardContent className="pt-6 text-center">
                    <LinkIcon className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                    <p className="font-medium">Enter URL</p>
                    <p className="text-sm text-muted-foreground">
                      We&apos;ll extract the content
                    </p>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>

          {/* AI Customization Preview */}
          <Card className="lg:col-span-2 bg-gradient-to-br from-violet-500/10 to-primary/10 border-violet-500/20">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-violet-500" />
                <CardTitle>AI-Powered Customization</CardTitle>
              </div>
              <CardDescription>
                Our AI will analyze the job description and optimize your resume
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="p-4 rounded-lg bg-background/50">
                  <h4 className="font-medium mb-1">Keyword Optimization</h4>
                  <p className="text-sm text-muted-foreground">
                    Match your skills with job requirements
                  </p>
                </div>
                <div className="p-4 rounded-lg bg-background/50">
                  <h4 className="font-medium mb-1">Content Rewriting</h4>
                  <p className="text-sm text-muted-foreground">
                    Tailor bullet points to highlight relevant experience
                  </p>
                </div>
                <div className="p-4 rounded-lg bg-background/50">
                  <h4 className="font-medium mb-1">ATS Compatibility</h4>
                  <p className="text-sm text-muted-foreground">
                    Ensure your resume passes applicant tracking systems
                  </p>
                </div>
              </div>
              <div className="mt-6 flex justify-center">
                <Button size="lg" disabled>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Start Customization
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
