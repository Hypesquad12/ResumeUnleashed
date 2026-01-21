'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { CheckCircle } from 'lucide-react'

export default function MandateSuccessPage() {
  const router = useRouter()

  useEffect(() => {
    // Load Google Ads gtag script
    const script1 = document.createElement('script')
    script1.async = true
    script1.src = 'https://www.googletagmanager.com/gtag/js?id=AW-17885779962'
    document.head.appendChild(script1)

    // Initialize gtag
    const script2 = document.createElement('script')
    script2.innerHTML = `
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', 'AW-17885779962');
    `
    document.head.appendChild(script2)

    // Redirect to settings after 2 seconds
    const timer = setTimeout(() => {
      router.push('/settings')
    }, 2000)

    return () => {
      clearTimeout(timer)
      if (document.head.contains(script1)) document.head.removeChild(script1)
      if (document.head.contains(script2)) document.head.removeChild(script2)
    }
  }, [router])

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 to-purple-50 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardContent className="p-8">
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center">
              <CheckCircle className="h-10 w-10 text-white" />
            </div>
            <div className="space-y-2">
              <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-200">
                Subscription Activated!
              </h1>
              <p className="text-slate-600 dark:text-slate-400">
                Your mandate has been authenticated successfully.
              </p>
              <p className="text-sm text-slate-500 dark:text-slate-500">
                Redirecting to your account settings...
              </p>
            </div>
            <div className="flex gap-2">
              <span className="w-2 h-2 bg-violet-500 rounded-full animate-pulse" />
              <span className="w-2 h-2 bg-violet-500 rounded-full animate-pulse delay-75" />
              <span className="w-2 h-2 bg-violet-500 rounded-full animate-pulse delay-150" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
