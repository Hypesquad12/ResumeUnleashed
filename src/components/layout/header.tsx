
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { createClient } from '@/lib/supabase/client'
import { useNavigate } from 'react-router-dom'
import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import type { Database } from '@/types/database'
import { Notifications } from './notifications'

type Profile = Database['public']['Tables']['profiles']['Row']

interface HeaderProps {
  user: Profile | null
}

export function Header({ user }: HeaderProps) {
  const navigate = useNavigate()

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    navigate('/login')
  }

  const initials = user?.full_name
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase() || 'U'

  return (
    <header className="h-16 border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-950/80 backdrop-blur-sm px-6 flex items-center justify-between sticky top-0 z-40">
      {/* Search with improved styling */}
      <div className="flex items-center gap-4 flex-1 max-w-md">
        <div className="relative w-full group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-violet-500 transition-colors" />
          <Input
            placeholder="Search resumes, templates..."
            className="pl-9 bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 focus:border-violet-500 focus:ring-violet-500/20 rounded-xl transition-all"
          />
        </div>
      </div>

      {/* Right side with better spacing */}
      <div className="flex items-center gap-3">
        <Notifications />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-10 w-10 rounded-full hover:ring-2 hover:ring-violet-500/20 transition-all">
              <Avatar className="h-10 w-10 ring-2 ring-slate-200 dark:ring-slate-700">
                <AvatarImage src={user?.avatar_url || ''} alt={user?.full_name || ''} />
                <AvatarFallback className="bg-gradient-to-br from-violet-500 to-indigo-500 text-white font-medium">{initials}</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56 rounded-xl shadow-lg border-slate-200 dark:border-slate-700" align="end" forceMount>
            <DropdownMenuLabel className="font-normal p-3">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-semibold leading-none">{user?.full_name}</p>
                <p className="text-xs leading-none text-muted-foreground">
                  {user?.email}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => navigate('/settings')} className="cursor-pointer rounded-lg mx-1">
              Settings
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate('/resumes')} className="cursor-pointer rounded-lg mx-1">
              My Resumes
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="text-red-600 dark:text-red-400 cursor-pointer rounded-lg mx-1 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-950/30">
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
