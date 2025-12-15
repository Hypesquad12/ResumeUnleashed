'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  FileText,
  LayoutDashboard,
  Sparkles,
  CreditCard,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Palette,
  Loader2,
  Brain,
  Target,
  DollarSign,
  Plus,
  Briefcase,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'
import { useState, useTransition } from 'react'

// Grouped navigation for better UX
const navigationGroups = [
  {
    label: null, // No label for main items
    items: [
      { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    ]
  },
  {
    label: 'Resume',
    items: [
      { name: 'My Resumes', href: '/resumes', icon: FileText },
      { name: 'AI Customize', href: '/customize', icon: Sparkles },
      { name: 'Templates', href: '/templates', icon: Palette },
    ]
  },
  {
    label: 'Career Tools',
    items: [
      { name: 'Interview Prep', href: '/interview', icon: Brain },
      { name: 'Resume Score', href: '/score', icon: Target },
      { name: 'Salary Guide', href: '/salary', icon: DollarSign },
      { name: 'Job Tracker', href: '/applications', icon: Briefcase },
    ]
  },
  {
    label: 'Professional',
    items: [
      { name: 'Visiting Cards', href: '/cards', icon: CreditCard },
    ]
  },
]

const bottomNavigation = [
  { name: 'Settings', href: '/settings', icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const [collapsed, setCollapsed] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [navigatingTo, setNavigatingTo] = useState<string | null>(null)

  const handleNavigation = (href: string) => {
    setNavigatingTo(href)
    startTransition(() => {
      router.push(href)
    })
  }

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <aside
      className={cn(
        'flex flex-col h-screen bg-card border-r transition-all duration-300',
        collapsed ? 'w-16' : 'w-64'
      )}
    >
      {/* Logo */}
      <div className="flex items-center justify-between h-16 px-4 border-b">
        {!collapsed && (
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="p-1.5 bg-primary rounded-lg">
              <FileText className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="font-semibold text-lg">ResumeAI</span>
          </Link>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCollapsed(!collapsed)}
          className={cn(collapsed && 'mx-auto')}
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-4 overflow-y-auto">
        {navigationGroups.map((group, groupIndex) => (
          <div key={groupIndex} className="space-y-1">
            {group.label && !collapsed && (
              <div className="px-3 py-1.5">
                <span className="text-xs font-semibold text-muted-foreground/70 uppercase tracking-wider">
                  {group.label}
                </span>
              </div>
            )}
            {group.items.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
              const isNavigating = isPending && navigatingTo === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  prefetch={true}
                  onClick={(e) => {
                    e.preventDefault()
                    handleNavigation(item.href)
                  }}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all w-full',
                    isActive
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
                    collapsed && 'justify-center px-2'
                  )}
                  title={collapsed ? item.name : undefined}
                >
                  {isNavigating ? (
                    <Loader2 className="h-4 w-4 flex-shrink-0 animate-spin" />
                  ) : (
                    <item.icon className="h-4 w-4 flex-shrink-0" />
                  )}
                  {!collapsed && <span>{item.name}</span>}
                </Link>
              )
            })}
          </div>
        ))}
      </nav>

      {/* Bottom Navigation */}
      <div className="p-3 border-t space-y-1">
        {bottomNavigation.map((item) => {
          const isActive = pathname === item.href
          const isNavigating = isPending && navigatingTo === item.href
          return (
            <Link
              key={item.name}
              href={item.href}
              prefetch={true}
              onClick={(e) => {
                e.preventDefault()
                handleNavigation(item.href)
              }}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors w-full',
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
                collapsed && 'justify-center px-2'
              )}
              title={collapsed ? item.name : undefined}
            >
              {isNavigating ? (
                <Loader2 className="h-5 w-5 flex-shrink-0 animate-spin" />
              ) : (
                <item.icon className="h-5 w-5 flex-shrink-0" />
              )}
              {!collapsed && <span>{item.name}</span>}
            </Link>
          )
        })}
        <button
          onClick={handleLogout}
          className={cn(
            'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors w-full',
            'text-muted-foreground hover:bg-destructive/10 hover:text-destructive',
            collapsed && 'justify-center px-2'
          )}
          title={collapsed ? 'Logout' : undefined}
        >
          <LogOut className="h-5 w-5 flex-shrink-0" />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </aside>
  )
}
