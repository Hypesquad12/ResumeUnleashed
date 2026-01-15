'use client'

import { useEffect, useMemo, useState } from 'react'
import { Loader2, Sparkles } from 'lucide-react'

export function AiLoadingOverlay() {
  const messages = useMemo(
    () => [
      'AI at work…',
      'Crafting the perfect resume…',
      'Optimizing keywords for ATS…',
      'Quantifying impact and achievements…',
      'Polishing formatting and clarity…',
    ],
    []
  )

  const [index, setIndex] = useState(0)

  useEffect(() => {
    const id = window.setInterval(() => {
      setIndex((i) => (i + 1) % messages.length)
    }, 1400)

    return () => window.clearInterval(id)
  }, [messages.length])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-md">
      <div className="w-full max-w-md px-6">
        <div className="rounded-2xl border border-slate-200 bg-white shadow-2xl shadow-slate-200/60 p-8 text-center">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-600 shadow-xl shadow-violet-500/25">
            <div className="relative">
              <Loader2 className="h-10 w-10 animate-spin text-white" />
              <Sparkles className="absolute -right-2 -top-2 h-4 w-4 text-white/90" />
            </div>
          </div>

          <div className="text-xl font-semibold text-slate-900">{messages[index]}</div>
          <div className="mt-2 text-sm text-slate-600">
            This usually takes a few seconds. Please don’t close the tab.
          </div>

          <div className="mt-6 h-2 w-full overflow-hidden rounded-full bg-slate-100">
            <div className="h-full w-1/2 animate-[progress_1.4s_ease-in-out_infinite] rounded-full bg-gradient-to-r from-teal-500 via-cyan-500 to-violet-600" />
          </div>
        </div>
      </div>

      <style jsx global>{`
        @keyframes progress {
          0% { transform: translateX(-60%); }
          50% { transform: translateX(40%); }
          100% { transform: translateX(160%); }
        }
      `}</style>
    </div>
  )
}
