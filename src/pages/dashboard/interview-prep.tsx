import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Brain } from 'lucide-react'

export default function InterviewPrepPage() {
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Interview Prep</h1>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            AI Interview Practice
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">
            Practice interviews with AI-powered mock sessions.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
