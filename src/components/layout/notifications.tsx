
import { Button } from '@/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Bell } from 'lucide-react'

export function Notifications() {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="border-b px-4 py-3">
          <h4 className="font-semibold">Notifications</h4>
          <p className="text-xs text-muted-foreground">Your notifications</p>
        </div>
        <div className="p-8 text-center">
          <Bell className="h-8 w-8 mx-auto text-muted-foreground/50 mb-2" />
          <p className="text-sm text-muted-foreground">No notifications</p>
        </div>
      </PopoverContent>
    </Popover>
  )
}
