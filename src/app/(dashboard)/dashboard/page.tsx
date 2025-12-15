import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { FileText, Sparkles, CreditCard, Plus, ArrowRight, Brain, Target, Briefcase, TrendingUp, Clock } from 'lucide-react'
import Link from 'next/link'
import { DashboardClient } from '@/components/dashboard/dashboard-client'

export default async function DashboardPage() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  // Fetch stats including interview sessions
  const [
    { count: resumeCount },
    { count: customizedCount },
    { count: cardCount },
    { count: interviewCount },
    { data: recentResumes },
    { data: recentInterviews },
  ] = await Promise.all([
    supabase.from('resumes').select('*', { count: 'exact', head: true }).eq('user_id', user!.id),
    supabase.from('customized_resumes').select('*', { count: 'exact', head: true }).eq('user_id', user!.id),
    supabase.from('visiting_cards').select('*', { count: 'exact', head: true }).eq('user_id', user!.id),
    (supabase as any).from('interview_sessions').select('*', { count: 'exact', head: true }).eq('user_id', user!.id),
    supabase.from('resumes').select('*').eq('user_id', user!.id).order('created_at', { ascending: false }).limit(3),
    (supabase as any).from('interview_sessions').select('id, job_title, overall_score, created_at').eq('user_id', user!.id).order('created_at', { ascending: false }).limit(3),
  ])

  // Fetch profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name')
    .eq('id', user!.id)
    .single()

  const isNewUser = (resumeCount || 0) === 0
  const userName = profile?.full_name || user?.user_metadata?.full_name
  const firstName = userName?.split(' ')[0] || 'there'

  // Calculate average interview score
  const avgInterviewScore = recentInterviews && recentInterviews.length > 0
    ? Math.round(recentInterviews.reduce((sum: number, i: any) => sum + (i.overall_score || 0), 0) / recentInterviews.length)
    : null

  return (
    <DashboardClient isNewUser={isNewUser} userName={userName}>
    <div className="space-y-8">
      {/* Welcome Section - More Personal */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {isNewUser ? `Welcome, ${firstName}! 👋` : `Welcome back, ${firstName}!`}
          </h1>
          <p className="text-muted-foreground mt-1">
            {isNewUser 
              ? "Let's build your professional presence together."
              : "Here's your career toolkit at a glance."}
          </p>
        </div>
        <Link href="/resumes/new">
          <Button size="lg" className="hidden md:flex">
            <Plus className="mr-2 h-4 w-4" />
            New Resume
          </Button>
        </Link>
      </div>

      {/* Stats Grid - Cleaner Design */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <Link href="/resumes">
          <Card className="hover:shadow-md transition-all cursor-pointer group">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Resumes</p>
                  <p className="text-3xl font-bold mt-1">{resumeCount || 0}</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <FileText className="h-5 w-5 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/customize">
          <Card className="hover:shadow-md transition-all cursor-pointer group">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">AI Tailored</p>
                  <p className="text-3xl font-bold mt-1">{customizedCount || 0}</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-violet-500/10 flex items-center justify-center group-hover:bg-violet-500/20 transition-colors">
                  <Sparkles className="h-5 w-5 text-violet-500" />
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/interview">
          <Card className="hover:shadow-md transition-all cursor-pointer group">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Interviews</p>
                  <p className="text-3xl font-bold mt-1">{interviewCount || 0}</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center group-hover:bg-amber-500/20 transition-colors">
                  <Brain className="h-5 w-5 text-amber-500" />
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/cards">
          <Card className="hover:shadow-md transition-all cursor-pointer group">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Cards</p>
                  <p className="text-3xl font-bold mt-1">{cardCount || 0}</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center group-hover:bg-emerald-500/20 transition-colors">
                  <CreditCard className="h-5 w-5 text-emerald-500" />
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Quick Actions - Streamlined */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
          <Link href="/resumes/new" className="block">
            <Card className="h-full hover:shadow-md hover:border-primary/50 transition-all cursor-pointer">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Plus className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium">Create Resume</p>
                  <p className="text-xs text-muted-foreground">Start fresh or upload</p>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/customize" className="block">
            <Card className="h-full hover:shadow-md hover:border-violet-500/50 transition-all cursor-pointer">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-violet-500/10 flex items-center justify-center flex-shrink-0">
                  <Sparkles className="h-5 w-5 text-violet-500" />
                </div>
                <div>
                  <p className="font-medium">AI Customize</p>
                  <p className="text-xs text-muted-foreground">Tailor for a job</p>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/interview" className="block">
            <Card className="h-full hover:shadow-md hover:border-amber-500/50 transition-all cursor-pointer">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center flex-shrink-0">
                  <Brain className="h-5 w-5 text-amber-500" />
                </div>
                <div>
                  <p className="font-medium">Practice Interview</p>
                  <p className="text-xs text-muted-foreground">AI-powered prep</p>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/score" className="block">
            <Card className="h-full hover:shadow-md hover:border-teal-500/50 transition-all cursor-pointer">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-teal-500/10 flex items-center justify-center flex-shrink-0">
                  <Target className="h-5 w-5 text-teal-500" />
                </div>
                <div>
                  <p className="font-medium">Check Score</p>
                  <p className="text-xs text-muted-foreground">ATS compatibility</p>
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>

      {/* Recent Activity - Two Column Layout */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Resumes */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div>
              <CardTitle className="text-base">Recent Resumes</CardTitle>
            </div>
            <Link href="/resumes">
              <Button variant="ghost" size="sm" className="text-xs">
                View All <ArrowRight className="ml-1 h-3 w-3" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {recentResumes && recentResumes.length > 0 ? (
              <div className="space-y-3">
                {recentResumes.map((resume) => (
                  <Link
                    key={resume.id}
                    href={`/resumes/${resume.id}`}
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent/50 transition-colors group"
                  >
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <FileText className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{resume.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(resume.updated_at || resume.created_at!).toLocaleDateString()}
                      </p>
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-6">
                <div className="w-12 h-12 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-3">
                  <FileText className="h-6 w-6 text-muted-foreground/50" />
                </div>
                <p className="text-sm text-muted-foreground mb-3">No resumes yet</p>
                <Link href="/resumes/new">
                  <Button size="sm">Create Resume</Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Interview Practice */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div>
              <CardTitle className="text-base">Interview Practice</CardTitle>
            </div>
            <Link href="/interview">
              <Button variant="ghost" size="sm" className="text-xs">
                Practice <ArrowRight className="ml-1 h-3 w-3" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {recentInterviews && recentInterviews.length > 0 ? (
              <div className="space-y-3">
                {recentInterviews.map((interview: any) => (
                  <div
                    key={interview.id}
                    className="flex items-center gap-3 p-3 rounded-lg bg-accent/30"
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                      interview.overall_score >= 70 ? 'bg-emerald-100' :
                      interview.overall_score >= 50 ? 'bg-amber-100' : 'bg-red-100'
                    }`}>
                      <span className={`text-xs font-bold ${
                        interview.overall_score >= 70 ? 'text-emerald-600' :
                        interview.overall_score >= 50 ? 'text-amber-600' : 'text-red-600'
                      }`}>
                        {interview.overall_score}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{interview.job_title}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(interview.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6">
                <div className="w-12 h-12 rounded-full bg-amber-50 flex items-center justify-center mx-auto mb-3">
                  <Brain className="h-6 w-6 text-amber-500/50" />
                </div>
                <p className="text-sm text-muted-foreground mb-3">No practice sessions yet</p>
                <Link href="/interview">
                  <Button size="sm" variant="outline">Start Practice</Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
    </DashboardClient>
  )
}
