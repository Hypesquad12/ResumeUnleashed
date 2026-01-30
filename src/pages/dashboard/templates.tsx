import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Palette } from 'lucide-react'

export default function TemplatesPage() {
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Templates</h1>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            Resume Templates
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">
            Choose from professional resume templates.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
