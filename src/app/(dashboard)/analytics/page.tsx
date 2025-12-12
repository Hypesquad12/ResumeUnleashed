import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Eye, MousePointer, Users, TrendingUp, FileText, CreditCard, Globe, Clock } from 'lucide-react'
import { ViewsChart } from './analytics-charts'

interface AnalyticsEvent {
  id: string
  viewed_at: string | null
  referrer: string | null
  user_agent: string | null
  link_id: string | null
  card_id: string | null
}

export default async function AnalyticsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Fetch analytics data
  const { data: resumeLinks } = await supabase
    .from('public_resume_links')
    .select('id, public_slug, view_count, created_at')
    .eq('user_id', user!.id)
    .order('view_count', { ascending: false })

  const { data: cards } = await supabase
    .from('visiting_cards')
    .select('id, name, public_slug')
    .eq('user_id', user!.id)

  // Fetch recent analytics events (last 30 days)
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  const { data: recentEvents } = await supabase
    .from('link_analytics')
    .select('id, viewed_at, referrer, user_agent, link_id, card_id')
    .or(`link_id.in.(${resumeLinks?.map(l => l.id).join(',') || 'null'}),card_id.in.(${cards?.map(c => c.id).join(',') || 'null'})`)
    .gte('viewed_at', thirtyDaysAgo.toISOString())
    .order('viewed_at', { ascending: false })
    .limit(100)

  const totalResumeViews = resumeLinks?.reduce((acc, link) => acc + (link.view_count || 0), 0) || 0
  
  // Count card views from analytics events
  const cardIds = new Set(cards?.map(c => c.id) || [])
  const totalCardViews = recentEvents?.filter(e => e.card_id && cardIds.has(e.card_id)).length || 0
  const totalViews = totalResumeViews + totalCardViews

  // Build chart data - aggregate views by day
  const viewsByDay: Record<string, number> = {}
  const today = new Date()
  for (let i = 29; i >= 0; i--) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)
    const key = date.toISOString().split('T')[0]
    viewsByDay[key] = 0
  }

  recentEvents?.forEach(event => {
    if (event.viewed_at) {
      const day = event.viewed_at.split('T')[0]
      if (viewsByDay[day] !== undefined) {
        viewsByDay[day]++
      }
    }
  })

  const chartData = Object.entries(viewsByDay).map(([date, views]) => ({
    date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    views,
  }))

  // Get device breakdown from user agents
  const getDeviceType = (ua: string | null): string => {
    if (!ua) return 'Unknown'
    if (/mobile/i.test(ua)) return 'Mobile'
    if (/tablet/i.test(ua)) return 'Tablet'
    return 'Desktop'
  }

  const deviceCounts = recentEvents?.reduce((acc, e) => {
    const device = getDeviceType(e.user_agent)
    acc[device] = (acc[device] || 0) + 1
    return acc
  }, {} as Record<string, number>) || {}

  const stats = [
    { name: 'Total Views', value: totalViews, icon: Eye },
    { name: 'Resume Views', value: totalResumeViews, icon: FileText },
    { name: 'Card Scans', value: totalCardViews, icon: CreditCard },
    { name: 'Unique Links', value: (resumeLinks?.length || 0) + (cards?.length || 0), icon: Globe },
  ]

  // Map link_id to slug for display
  const linkIdToSlug = new Map(resumeLinks?.map(l => [l.id, l.public_slug]) || [])
  const cardIdToName = new Map(cards?.map(c => [c.id, c.name]) || [])

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
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Views Over Time</CardTitle>
            <CardDescription>Daily views for the past 30 days</CardDescription>
          </CardHeader>
          <CardContent>
            <ViewsChart data={chartData} />
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
                  {resumeLinks?.slice(0, 5).map((link, i) => (
                    <div key={link.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary text-sm font-bold">
                          {i + 1}
                        </span>
                        <div>
                          <p className="font-medium flex items-center gap-2">
                            <FileText className="h-4 w-4 text-muted-foreground" />
                            Resume
                          </p>
                          <p className="text-sm text-muted-foreground">/r/{link.public_slug}</p>
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

      {/* Device Breakdown & Recent Activity */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Device Breakdown</CardTitle>
            <CardDescription>How viewers access your content</CardDescription>
          </CardHeader>
          <CardContent>
            {Object.keys(deviceCounts).length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                No device data yet
              </p>
            ) : (
              <div className="space-y-3">
                {Object.entries(deviceCounts).map(([device, count]) => {
                  const total = Object.values(deviceCounts).reduce((a, b) => a + b, 0)
                  const percentage = Math.round((count / total) * 100)
                  return (
                    <div key={device}>
                      <div className="flex justify-between text-sm mb-1">
                        <span>{device}</span>
                        <span className="text-muted-foreground">{count} ({percentage}%)</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-primary rounded-full transition-all"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest views and interactions</CardDescription>
          </CardHeader>
          <CardContent>
            {!recentEvents || recentEvents.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Eye className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No activity yet</p>
                <p className="text-sm">Share your resume or card links to see who&apos;s viewing them</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {recentEvents.slice(0, 10).map((event) => {
                  const isResume = !!event.link_id
                  const slug = event.link_id ? linkIdToSlug.get(event.link_id) : null
                  const cardName = event.card_id ? cardIdToName.get(event.card_id) : null
                  const viewedAt = event.viewed_at ? new Date(event.viewed_at) : null
                  const timeAgo = viewedAt ? getTimeAgo(viewedAt) : 'Unknown'
                  const device = getDeviceType(event.user_agent)

                  return (
                    <div key={event.id} className="flex items-center gap-3 text-sm">
                      <div className={`p-2 rounded-full ${isResume ? 'bg-blue-100' : 'bg-green-100'}`}>
                        {isResume ? (
                          <FileText className="h-4 w-4 text-blue-600" />
                        ) : (
                          <CreditCard className="h-4 w-4 text-green-600" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">
                          {isResume ? `Resume viewed` : `Card "${cardName}" scanned`}
                        </p>
                        <p className="text-muted-foreground text-xs flex items-center gap-2">
                          <Clock className="h-3 w-3" />
                          {timeAgo} · {device}
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function getTimeAgo(date: Date): string {
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000)
  
  if (seconds < 60) return 'Just now'
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`
  return date.toLocaleDateString()
}
