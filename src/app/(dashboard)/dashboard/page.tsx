import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { FileText, Sparkles, CreditCard, Eye, Plus, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { DashboardClient } from '@/components/dashboard/dashboard-client'

export default async function DashboardPage() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  // Fetch stats
  const [
    { count: resumeCount },
    { count: customizedCount },
    { count: cardCount },
    { data: recentResumes },
  ] = await Promise.all([
    supabase.from('resumes').select('*', { count: 'exact', head: true }).eq('user_id', user!.id),
    supabase.from('customized_resumes').select('*', { count: 'exact', head: true }).eq('user_id', user!.id),
    supabase.from('visiting_cards').select('*', { count: 'exact', head: true }).eq('user_id', user!.id),
    supabase.from('resumes').select('*').eq('user_id', user!.id).order('created_at', { ascending: false }).limit(3),
  ])

  // Fetch profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name')
    .eq('id', user!.id)
    .single()

  // For now, set totalViews to 0 (complex query needs optimization)
  const totalViews = 0

  const stats = [
    { name: 'Total Resumes', value: resumeCount || 0, icon: FileText, href: '/resumes' },
    { name: 'AI Customized', value: customizedCount || 0, icon: Sparkles, href: '/customize' },
    { name: 'Visiting Cards', value: cardCount || 0, icon: CreditCard, href: '/cards' },
    { name: 'Total Views', value: totalViews || 0, icon: Eye, href: '/analytics' },
  ]

  const isNewUser = (resumeCount || 0) === 0
  const userName = profile?.full_name || user?.user_metadata?.full_name

  return (
    <DashboardClient isNewUser={isNewUser} userName={userName}>
    <div className="space-y-8">
      {/* Welcome Section */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Welcome back! Here&apos;s an overview of your resume builder activity.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Link key={stat.name} href={stat.href}>
            <Card className="hover:bg-accent/50 transition-colors cursor-pointer">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.name}
                </CardTitle>
                <stat.icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Create Resume
            </CardTitle>
            <CardDescription>
              Start from scratch or upload an existing resume
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/resumes/new">
              <Button className="w-full">
                Get Started
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-violet-500/10 to-violet-500/5 border-violet-500/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5" />
              AI Customize
            </CardTitle>
            <CardDescription>
              Tailor your resume for a specific job description
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/customize">
              <Button variant="outline" className="w-full border-violet-500/50 hover:bg-violet-500/10 hover:text-violet-700 dark:hover:text-violet-300">
                Customize Now
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 border-emerald-500/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Visiting Card
            </CardTitle>
            <CardDescription>
              Create a digital business card with QR code
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/cards/new">
              <Button variant="outline" className="w-full border-emerald-500/50 hover:bg-emerald-500/10 hover:text-emerald-700 dark:hover:text-emerald-300">
                Create Card
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Recent Resumes */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Recent Resumes</CardTitle>
            <CardDescription>Your latest resume documents</CardDescription>
          </div>
          <Link href="/resumes">
            <Button variant="outline" size="sm">
              View All
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          {recentResumes && recentResumes.length > 0 ? (
            <div className="space-y-4">
              {recentResumes.map((resume) => (
                <div
                  key={resume.id}
                  className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <FileText className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">{resume.title}</p>
                      <p className="text-sm text-muted-foreground">
                        Updated {new Date(resume.updated_at || resume.created_at!).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <Link href={`/resumes/${resume.id}`}>
                    <Button variant="ghost" size="sm">
                      Edit
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 mx-auto text-muted-foreground/50" />
              <p className="mt-4 text-muted-foreground">No resumes yet</p>
              <Link href="/resumes/new">
                <Button className="mt-4">Create Your First Resume</Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
    </DashboardClient>
  )
}
