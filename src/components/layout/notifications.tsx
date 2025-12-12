'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Bell, Eye, CreditCard, FileText, Clock } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

interface Notification {
  id: string
  type: 'resume_view' | 'card_view'
  title: string
  message: string
  timestamp: string
  read: boolean
}

export function Notifications() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (open) {
      loadNotifications()
    }
  }, [open])

  const loadNotifications = async () => {
    setLoading(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      setLoading(false)
      return
    }

    // Get recent resume link views
    const { data: resumeLinks } = await supabase
      .from('public_resume_links')
      .select('id, public_slug')
      .eq('user_id', user.id)

    const linkIds = (resumeLinks as any[])?.map(l => l.id) || []

    // Get recent card views
    const { data: cards } = await supabase
      .from('visiting_cards')
      .select('id, name')
      .eq('user_id', user.id)

    const cardIds = cards?.map(c => c.id) || []

    // Get analytics for both
    const { data: analytics } = await supabase
      .from('link_analytics')
      .select('*')
      .or(`link_id.in.(${linkIds.join(',')}),card_id.in.(${cardIds.join(',')})`)
      .order('viewed_at', { ascending: false })
      .limit(10)

    // Transform to notifications
    const notifs: Notification[] = (analytics || []).map((event) => {
      const isCard = !!event.card_id
      const card = cards?.find(c => c.id === event.card_id)
      const link = (resumeLinks as any[])?.find(l => l.id === event.link_id)
      
      return {
        id: event.id,
        type: isCard ? 'card_view' : 'resume_view',
        title: isCard ? 'Card Viewed' : 'Resume Viewed',
        message: isCard 
          ? `Someone viewed ${card?.name || 'your'} card`
          : `Someone viewed your resume via /${link?.public_slug || 'link'}`,
        timestamp: event.viewed_at || new Date().toISOString(),
        read: false,
      }
    })

    setNotifications(notifs)
    setLoading(false)
  }

  const unreadCount = notifications.filter(n => !n.read).length

  const getIcon = (type: string) => {
    switch (type) {
      case 'resume_view':
        return <FileText className="h-4 w-4 text-blue-500" />
      case 'card_view':
        return <CreditCard className="h-4 w-4 text-purple-500" />
      default:
        return <Eye className="h-4 w-4 text-gray-500" />
    }
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 h-2 w-2 bg-primary rounded-full" />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="border-b px-4 py-3">
          <h4 className="font-semibold">Notifications</h4>
          <p className="text-xs text-muted-foreground">Recent activity on your content</p>
        </div>
        <div className="max-h-80 overflow-y-auto">
          {loading ? (
            <div className="p-4 text-center text-sm text-muted-foreground">
              Loading...
            </div>
          ) : notifications.length === 0 ? (
            <div className="p-8 text-center">
              <Bell className="h-8 w-8 mx-auto text-muted-foreground/50 mb-2" />
              <p className="text-sm text-muted-foreground">No notifications yet</p>
              <p className="text-xs text-muted-foreground mt-1">
                You&apos;ll see activity when people view your resumes or cards
              </p>
            </div>
          ) : (
            <div className="divide-y">
              {notifications.map((notif) => (
                <div
                  key={notif.id}
                  className="px-4 py-3 hover:bg-muted/50 transition-colors cursor-pointer"
                >
                  <div className="flex gap-3">
                    <div className="mt-0.5">{getIcon(notif.type)}</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{notif.title}</p>
                      <p className="text-xs text-muted-foreground truncate">
                        {notif.message}
                      </p>
                      <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {formatDistanceToNow(new Date(notif.timestamp), { addSuffix: true })}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        {notifications.length > 0 && (
          <div className="border-t px-4 py-2">
            <Button variant="ghost" size="sm" className="w-full text-xs" asChild>
              <a href="/analytics">View all activity</a>
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  )
}
