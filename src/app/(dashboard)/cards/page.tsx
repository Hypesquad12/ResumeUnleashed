import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CreditCard, Plus, QrCode, Download, Share2, MoreVertical } from 'lucide-react'
import Link from 'next/link'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export default async function CardsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  const { data: cards } = await supabase
    .from('visiting_cards')
    .select('*')
    .eq('user_id', user!.id)
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Visiting Cards</h1>
          <p className="text-muted-foreground mt-1">
            Create and manage your digital business cards
          </p>
        </div>
        <Link href="/cards/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Card
          </Button>
        </Link>
      </div>

      {cards && cards.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {cards.map((card) => (
            <Card key={card.id} className="group overflow-hidden">
              {/* Card Preview */}
              <div 
                className="aspect-[1.75/1] relative p-6 flex flex-col justify-between"
                style={{ backgroundColor: card.theme_color || '#1a1a2e' }}
              >
                <div className="text-white">
                  <h3 className="text-xl font-bold">{card.name}</h3>
                  {card.title && <p className="text-white/80 text-sm">{card.title}</p>}
                  {card.company && <p className="text-white/60 text-xs mt-1">{card.company}</p>}
                </div>
                <div className="text-white/80 text-xs space-y-0.5">
                  {card.email && <p>{card.email}</p>}
                  {card.phone && <p>{card.phone}</p>}
                </div>
                {card.qr_code_url && (
                  <div className="absolute bottom-4 right-4 w-12 h-12 bg-white rounded p-1">
                    <QrCode className="w-full h-full text-slate-900" />
                  </div>
                )}
                
                {/* Hover Actions */}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <Button size="sm" variant="secondary">
                    <Share2 className="h-4 w-4 mr-1" />
                    Share
                  </Button>
                  <Button size="sm" variant="secondary">
                    <Download className="h-4 w-4 mr-1" />
                    Download
                  </Button>
                </div>
              </div>

              <CardHeader className="flex flex-row items-center justify-between py-3">
                <div>
                  <CardTitle className="text-base">{card.name}</CardTitle>
                  <CardDescription className="text-xs">
                    {card.public_slug ? `/${card.public_slug}` : 'No public link'}
                  </CardDescription>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild>
                      <Link href={`/cards/${card.id}`}>Edit</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem>Generate QR Code</DropdownMenuItem>
                    <DropdownMenuItem>Download PNG</DropdownMenuItem>
                    <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </CardHeader>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="p-4 bg-muted rounded-full mb-4">
              <CreditCard className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No visiting cards yet</h3>
            <p className="text-muted-foreground text-center mb-4 max-w-sm">
              Create a digital business card with QR code to share your contact information easily.
            </p>
            <Link href="/cards/new">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Create Card
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
