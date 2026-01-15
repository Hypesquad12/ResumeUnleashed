'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { MoreVertical, Edit, Trash2, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

interface CardsClientActionsProps {
  cardId: string
  cardName: string
}

export function CardsClientActions({ cardId, cardName }: CardsClientActionsProps) {
  const router = useRouter()
  const [deleting, setDeleting] = useState(false)

  const handleDelete = async () => {
    if (!confirm(`Are you sure you want to delete "${cardName}"?`)) return
    
    setDeleting(true)
    const supabase = createClient()
    const { error } = await supabase
      .from('visiting_cards')
      .delete()
      .eq('id', cardId)

    if (error) {
      toast.error('Failed to delete card')
      setDeleting(false)
      return
    }

    toast.success('Card deleted successfully')
    router.refresh()
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" disabled={deleting}>
          {deleting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <MoreVertical className="h-4 w-4" />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem asChild>
          <Link href={`/cards/new?edit=${cardId}`} className="flex items-center">
            <Edit className="mr-2 h-4 w-4" />
            Edit Card
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem 
          className="text-destructive focus:text-destructive"
          onClick={handleDelete}
        >
          <Trash2 className="mr-2 h-4 w-4" />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
