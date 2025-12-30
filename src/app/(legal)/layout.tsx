import { Toaster } from '@/components/ui/sonner'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default function LegalLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50">
      <div className="max-w-4xl mx-auto px-6 py-8">
        <Link 
          href="/"
          className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900 mb-6 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Home
        </Link>
        {children}
      </div>
      <Toaster />
    </div>
  )
}
