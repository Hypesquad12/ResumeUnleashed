import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

export default function CardsLoading() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Skeleton className="h-9 w-40" />
          <Skeleton className="h-5 w-64 mt-2" />
        </div>
        <Skeleton className="h-10 w-28" />
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="overflow-hidden">
            <Skeleton className="aspect-[1.75/1]" />
            <CardHeader className="py-3">
              <div className="flex items-center justify-between">
                <div>
                  <Skeleton className="h-5 w-28" />
                  <Skeleton className="h-4 w-20 mt-1" />
                </div>
                <Skeleton className="h-8 w-8" />
              </div>
            </CardHeader>
          </Card>
        ))}
      </div>
    </div>
  )
}
