import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CreditCard } from 'lucide-react'

export default function VisitingCardsPage() {
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Visiting Cards</h1>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Digital Business Cards
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">
            Create professional digital visiting cards.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
