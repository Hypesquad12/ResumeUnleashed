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
  Zap,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'
import { useState, useTransition } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

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
        'flex flex-col h-screen bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-900 border-r border-slate-200 dark:border-slate-800 transition-all duration-300 ease-out',
        collapsed ? 'w-16' : 'w-64'
      )}
    >
      {/* Logo with gradient accent */}
      <div className="flex items-center justify-between h-16 px-4 border-b border-slate-200 dark:border-slate-800">
        {!collapsed && (
          <Link href="/dashboard" className="flex items-center gap-2 group">
            <div className="p-1.5 bg-gradient-to-br from-violet-600 to-indigo-600 rounded-lg shadow-md shadow-violet-500/20 group-hover:shadow-lg group-hover:shadow-violet-500/30 transition-all duration-300">
              <Zap className="h-5 w-5 text-white" />
            </div>
            <span className="font-bold text-lg bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">ResumeAI</span>
          </Link>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCollapsed(!collapsed)}
          className={cn('hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors', collapsed && 'mx-auto')}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <motion.div
            animate={{ rotate: collapsed ? 0 : 180 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronRight className="h-4 w-4" />
          </motion.div>
        </Button>
      </div>

      {/* Navigation with smooth animations */}
      <nav className="flex-1 p-3 space-y-4 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-700">
        {navigationGroups.map((group, groupIndex) => (
          <div key={groupIndex} className="space-y-1">
            <AnimatePresence>
              {group.label && !collapsed && (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="px-3 py-1.5"
                >
                  <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                    {group.label}
                  </span>
                </motion.div>
              )}
            </AnimatePresence>
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
                    'relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 w-full group',
                    isActive
                      ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-md shadow-violet-500/25'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100',
                    collapsed && 'justify-center px-2'
                  )}
                  title={collapsed ? item.name : undefined}
                  aria-current={isActive ? 'page' : undefined}
                >
                  {isNavigating ? (
                    <Loader2 className="h-4 w-4 flex-shrink-0 animate-spin" />
                  ) : (
                    <item.icon className={cn(
                      'h-4 w-4 flex-shrink-0 transition-transform duration-200',
                      !isActive && 'group-hover:scale-110'
                    )} />
                  )}
                  <AnimatePresence>
                    {!collapsed && (
                      <motion.span
                        initial={{ opacity: 0, width: 0 }}
                        animate={{ opacity: 1, width: 'auto' }}
                        exit={{ opacity: 0, width: 0 }}
                        className="whitespace-nowrap overflow-hidden"
                      >
                        {item.name}
                      </motion.span>
                    )}
                  </AnimatePresence>
                  {isActive && !collapsed && (
                    <motion.div
                      layoutId="activeIndicator"
                      className="absolute right-2 w-1.5 h-1.5 rounded-full bg-white/80"
                    />
                  )}
                </Link>
              )
            })}
          </div>
        ))}
      </nav>

      {/* Bottom Navigation with improved styling */}
      <div className="p-3 border-t border-slate-200 dark:border-slate-800 space-y-1 bg-slate-50/50 dark:bg-slate-900/50">
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
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 w-full group',
                isActive
                  ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-md'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800',
                collapsed && 'justify-center px-2'
              )}
              title={collapsed ? item.name : undefined}
            >
              {isNavigating ? (
                <Loader2 className="h-5 w-5 flex-shrink-0 animate-spin" />
              ) : (
                <item.icon className={cn(
                  'h-5 w-5 flex-shrink-0 transition-transform duration-200',
                  !isActive && 'group-hover:scale-110'
                )} />
              )}
              <AnimatePresence>
                {!collapsed && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    {item.name}
                  </motion.span>
                )}
              </AnimatePresence>
            </Link>
          )
        })}
        <button
          onClick={handleLogout}
          className={cn(
            'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 w-full group',
            'text-slate-500 dark:text-slate-500 hover:bg-red-50 dark:hover:bg-red-950/30 hover:text-red-600 dark:hover:text-red-400',
            collapsed && 'justify-center px-2'
          )}
          title={collapsed ? 'Logout' : undefined}
          aria-label="Sign out"
        >
          <LogOut className="h-5 w-5 flex-shrink-0 transition-transform duration-200 group-hover:scale-110" />
          <AnimatePresence>
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                Logout
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      </div>
    </aside>
  )
}
