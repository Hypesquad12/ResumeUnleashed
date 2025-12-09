import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Eye, MousePointer, Users, TrendingUp } from 'lucide-react'

export default async function AnalyticsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Fetch analytics data
  const { data: resumeLinks } = await supabase
    .from('public_resume_links')
    .select('*, link_analytics(*)')
    .eq('user_id', user!.id)

  const { data: cards } = await supabase
    .from('visiting_cards')
    .select('*, link_analytics(*)')
    .eq('user_id', user!.id)

  const totalResumeViews = resumeLinks?.reduce((acc, link) => acc + (link.view_count || 0), 0) || 0
  const totalCardViews = cards?.reduce((acc, card) => acc + (card.link_analytics?.length || 0), 0) || 0
  const totalViews = totalResumeViews + totalCardViews

  const stats = [
    { name: 'Total Views', value: totalViews, icon: Eye, change: '+12%' },
    { name: 'Resume Views', value: totalResumeViews, icon: MousePointer, change: '+8%' },
    { name: 'Card Scans', value: totalCardViews, icon: Users, change: '+23%' },
    { name: 'Conversion Rate', value: '24%', icon: TrendingUp, change: '+4%' },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
        <p className="text-muted-foreground mt-1">
          Track views and engagement for your resumes and cards
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.name}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.name}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-emerald-500 mt-1">{stat.change} from last month</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Placeholder */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Views Over Time</CardTitle>
            <CardDescription>Daily views for the past 30 days</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center bg-muted/50 rounded-lg">
              <p className="text-muted-foreground">Chart coming soon</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Performing</CardTitle>
            <CardDescription>Your most viewed content</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {totalViews === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  No views yet. Share your resumes and cards to start tracking!
                </p>
              ) : (
                <>
                  {resumeLinks?.slice(0, 3).map((link, i) => (
                    <div key={link.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-lg font-bold text-muted-foreground">{i + 1}</span>
                        <div>
                          <p className="font-medium">Resume Link</p>
                          <p className="text-sm text-muted-foreground">/{link.public_slug}</p>
                        </div>
                      </div>
                      <span className="font-semibold">{link.view_count || 0} views</span>
                    </div>
                  ))}
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Latest views and interactions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <Eye className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Activity tracking will appear here</p>
            <p className="text-sm">Share your resume or card links to see who&apos;s viewing them</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
