import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { FileText, Home, ArrowLeft } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      <div className="text-center max-w-md mx-auto">
        <div className="w-20 h-20 bg-white rounded-2xl shadow-xl flex items-center justify-center mx-auto mb-8 border border-slate-100 rotate-12">
          <FileText className="h-10 w-10 text-violet-600" />
        </div>
        
        <h1 className="text-6xl font-bold text-slate-900 mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-slate-800 mb-4">Page not found</h2>
        
        <p className="text-slate-600 mb-8">
          The page you're looking for doesn't exist or has been moved. 
          Let's get you back to building your career.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/">
            <Button size="lg" className="w-full sm:w-auto gap-2">
              <Home className="h-4 w-4" />
              Back to Home
            </Button>
          </Link>
          <Link href="/login">
            <Button variant="outline" size="lg" className="w-full sm:w-auto gap-2">
              <ArrowLeft className="h-4 w-4" />
              Sign In
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
