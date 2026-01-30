import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DollarSign } from 'lucide-react'

export default function SalaryGuidePage() {
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Salary Guide</h1>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Salary Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">
            Research salary ranges for your target positions.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
