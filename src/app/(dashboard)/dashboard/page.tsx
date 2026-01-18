import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { FileText, Sparkles, CreditCard, Plus, ArrowRight, Brain, Target, Briefcase, TrendingUp, Clock, Zap, ChevronRight, CheckCircle2 } from 'lucide-react'
import Link from 'next/link'
import { UsageWidget } from '@/components/dashboard/usage-widget'
import { DashboardClient } from '@/components/dashboard/dashboard-client'

export default async function DashboardPage() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  // Calculate start of current month for usage counts
  const startOfMonth = new Date()
  startOfMonth.setDate(1)
  startOfMonth.setHours(0, 0, 0, 0)
  
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
    supabase.from('customized_resumes').select('*', { count: 'exact', head: true }).eq('user_id', user!.id).gte('created_at', startOfMonth.toISOString()),
    supabase.from('visiting_cards').select('*', { count: 'exact', head: true }).eq('user_id', user!.id),
    (supabase as any).from('interview_sessions').select('*', { count: 'exact', head: true }).eq('user_id', user!.id).gte('created_at', startOfMonth.toISOString()),
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
      {/* Welcome Section with gradient accent */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-violet-600 via-indigo-600 to-purple-700 p-6 md:p-8 text-white">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2" />
        <div className="relative z-10 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="p-1.5 bg-white/20 rounded-lg backdrop-blur-sm">
                <Zap className="h-5 w-5" />
              </div>
              <span className="text-sm font-medium text-white/80">Career Dashboard</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
              {isNewUser ? `Welcome, ${firstName}! 👋` : `Welcome back, ${firstName}!`}
            </h1>
            <p className="text-white/80 mt-2 max-w-md">
              {isNewUser 
                ? "Let's build your professional presence together. Start by creating your first resume."
                : "Your career toolkit is ready. Here's what's happening."}
            </p>
          </div>
          <Link href="/resumes/new" className="hidden md:block">
            <Button size="lg" className="bg-white text-violet-700 hover:bg-white/90 shadow-lg shadow-black/20 font-semibold">
              <Plus className="mr-2 h-4 w-4" />
              New Resume
            </Button>
          </Link>
        </div>
        
        {/* Quick Stats in Welcome Banner */}
        {!isNewUser && (
          <div className="relative z-10 mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link href="/resumes" className="block group">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 hover:bg-white/20 transition-all cursor-pointer">
                <p className="text-white/70 text-xs font-medium">Resumes</p>
                <p className="text-2xl font-bold">{resumeCount || 0}</p>
              </div>
            </Link>
            <Link href="/customize" className="block group">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 hover:bg-white/20 transition-all cursor-pointer">
                <p className="text-white/70 text-xs font-medium">AI Tailored</p>
                <p className="text-2xl font-bold">{customizedCount || 0}</p>
              </div>
            </Link>
            <Link href="/interview" className="block group">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 hover:bg-white/20 transition-all cursor-pointer">
                <p className="text-white/70 text-xs font-medium">Interviews</p>
                <p className="text-2xl font-bold">{interviewCount || 0}</p>
              </div>
            </Link>
            <Link href="/interview" className="block group">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 hover:bg-white/20 transition-all cursor-pointer">
                <p className="text-white/70 text-xs font-medium">Avg Score</p>
                <p className="text-2xl font-bold">{avgInterviewScore || '—'}</p>
              </div>
            </Link>
          </div>
        )}
      </div>

      {/* Quick Actions - Modern Card Design */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-200">Quick Actions</h2>
          <span className="text-xs text-slate-500">Get started in seconds</span>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Link href="/resumes/new" className="block group">
            <Card className="h-full border-slate-200 dark:border-slate-800 hover:border-violet-300 dark:hover:border-violet-700 hover:shadow-lg hover:shadow-violet-500/10 transition-all duration-300 cursor-pointer overflow-hidden">
              <CardContent className="p-5 relative">
                <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-violet-500/10 to-transparent rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-500" />
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center mb-3 shadow-md shadow-violet-500/30 group-hover:scale-110 transition-transform">
                  <Plus className="h-6 w-6 text-white" />
                </div>
                <p className="font-semibold text-slate-800 dark:text-slate-200">Create Resume</p>
                <p className="text-sm text-slate-500 mt-1">Start fresh or upload existing</p>
                <ChevronRight className="absolute bottom-5 right-5 h-5 w-5 text-slate-300 group-hover:text-violet-500 group-hover:translate-x-1 transition-all" />
              </CardContent>
            </Card>
          </Link>

          <Link href="/customize" className="block group">
            <Card className="h-full border-slate-200 dark:border-slate-800 hover:border-amber-300 dark:hover:border-amber-700 hover:shadow-lg hover:shadow-amber-500/10 transition-all duration-300 cursor-pointer overflow-hidden">
              <CardContent className="p-5 relative">
                <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-amber-500/10 to-transparent rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-500" />
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center mb-3 shadow-md shadow-amber-500/30 group-hover:scale-110 transition-transform">
                  <Sparkles className="h-6 w-6 text-white" />
                </div>
                <p className="font-semibold text-slate-800 dark:text-slate-200">AI Customize</p>
                <p className="text-sm text-slate-500 mt-1">Tailor for any job posting</p>
                <ChevronRight className="absolute bottom-5 right-5 h-5 w-5 text-slate-300 group-hover:text-amber-500 group-hover:translate-x-1 transition-all" />
              </CardContent>
            </Card>
          </Link>

          <Link href="/interview" className="block group">
            <Card className="h-full border-slate-200 dark:border-slate-800 hover:border-emerald-300 dark:hover:border-emerald-700 hover:shadow-lg hover:shadow-emerald-500/10 transition-all duration-300 cursor-pointer overflow-hidden">
              <CardContent className="p-5 relative">
                <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-emerald-500/10 to-transparent rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-500" />
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center mb-3 shadow-md shadow-emerald-500/30 group-hover:scale-110 transition-transform">
                  <Brain className="h-6 w-6 text-white" />
                </div>
                <p className="font-semibold text-slate-800 dark:text-slate-200">Practice Interview</p>
                <p className="text-sm text-slate-500 mt-1">AI-powered mock interviews</p>
                <ChevronRight className="absolute bottom-5 right-5 h-5 w-5 text-slate-300 group-hover:text-emerald-500 group-hover:translate-x-1 transition-all" />
              </CardContent>
            </Card>
          </Link>

          <Link href="/score" className="block group">
            <Card className="h-full border-slate-200 dark:border-slate-800 hover:border-cyan-300 dark:hover:border-cyan-700 hover:shadow-lg hover:shadow-cyan-500/10 transition-all duration-300 cursor-pointer overflow-hidden">
              <CardContent className="p-5 relative">
                <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-cyan-500/10 to-transparent rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-500" />
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center mb-3 shadow-md shadow-cyan-500/30 group-hover:scale-110 transition-transform">
                  <Target className="h-6 w-6 text-white" />
                </div>
                <p className="font-semibold text-slate-800 dark:text-slate-200">Check Score</p>
                <p className="text-sm text-slate-500 mt-1">ATS compatibility analysis</p>
                <ChevronRight className="absolute bottom-5 right-5 h-5 w-5 text-slate-300 group-hover:text-cyan-500 group-hover:translate-x-1 transition-all" />
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>

      {/* Recent Activity - Three Column Layout with Usage Widget */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Recent Resumes */}
        <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center">
                <FileText className="h-4 w-4 text-violet-600" />
              </div>
              <CardTitle className="text-base font-semibold">Recent Resumes</CardTitle>
            </div>
            <Link href="/resumes">
              <Button variant="ghost" size="sm" className="text-xs text-violet-600 hover:text-violet-700 hover:bg-violet-50">
                View All <ArrowRight className="ml-1 h-3 w-3" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {recentResumes && recentResumes.length > 0 ? (
              <div className="space-y-2">
                {recentResumes.map((resume) => (
                  <Link
                    key={resume.id}
                    href={`/resumes/${resume.id}`}
                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all duration-200 group border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
                  >
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-slate-100 to-slate-50 dark:from-slate-800 dark:to-slate-900 flex items-center justify-center flex-shrink-0 border border-slate-200 dark:border-slate-700">
                      <FileText className="h-5 w-5 text-slate-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate text-slate-800 dark:text-slate-200">{resume.title}</p>
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <Clock className="h-3 w-3" />
                        {new Date(resume.updated_at || resume.created_at!).toLocaleDateString()}
                      </div>
                    </div>
                    <ChevronRight className="h-5 w-5 text-slate-300 group-hover:text-violet-500 group-hover:translate-x-1 transition-all" />
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto mb-4">
                  <FileText className="h-8 w-8 text-slate-400" />
                </div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">No resumes yet</p>
                <p className="text-xs text-slate-500 mb-4">Create your first resume to get started</p>
                <Link href="/resumes/new">
                  <Button size="sm" className="bg-violet-600 hover:bg-violet-700">Create Resume</Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Interview Practice */}
        <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                <Brain className="h-4 w-4 text-emerald-600" />
              </div>
              <CardTitle className="text-base font-semibold">Interview Practice</CardTitle>
            </div>
            <Link href="/interview">
              <Button variant="ghost" size="sm" className="text-xs text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50">
                Practice <ArrowRight className="ml-1 h-3 w-3" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {recentInterviews && recentInterviews.length > 0 ? (
              <div className="space-y-2">
                {recentInterviews.map((interview: any) => (
                  <div
                    key={interview.id}
                    className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800"
                  >
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ring-2 ${
                      interview.overall_score >= 70 ? 'bg-emerald-100 ring-emerald-200 dark:ring-emerald-800' :
                      interview.overall_score >= 50 ? 'bg-amber-100 ring-amber-200 dark:ring-amber-800' : 'bg-red-100 ring-red-200 dark:ring-red-800'
                    }`}>
                      <span className={`text-sm font-bold ${
                        interview.overall_score >= 70 ? 'text-emerald-600' :
                        interview.overall_score >= 50 ? 'text-amber-600' : 'text-red-600'
                      }`}>
                        {interview.overall_score}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate text-slate-800 dark:text-slate-200">{interview.job_title}</p>
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <Clock className="h-3 w-3" />
                        {new Date(interview.created_at).toLocaleDateString()}
                      </div>
                    </div>
                    <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                      interview.overall_score >= 70 ? 'bg-emerald-100 text-emerald-700' :
                      interview.overall_score >= 50 ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {interview.overall_score >= 70 ? 'Strong' : interview.overall_score >= 50 ? 'Good' : 'Needs Work'}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="w-16 h-16 rounded-2xl bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center mx-auto mb-4">
                  <Brain className="h-8 w-8 text-emerald-400" />
                </div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">No practice sessions yet</p>
                <p className="text-xs text-slate-500 mb-4">Ace your next interview with AI-powered practice</p>
                <Link href="/interview">
                  <Button size="sm" variant="outline" className="border-emerald-300 text-emerald-700 hover:bg-emerald-50">Start Practice</Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Usage & Limits Widget */}
        <UsageWidget />
      </div>
    </div>
    </DashboardClient>
  )
}
