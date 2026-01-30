import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Sparkles } from 'lucide-react'

export default function AICustomizePage() {
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">AI Customize</h1>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            AI Resume Customization
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">
            Tailor your resume for specific job postings using AI.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
