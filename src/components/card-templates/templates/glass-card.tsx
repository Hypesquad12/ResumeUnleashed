'use client'

import { cn } from '@/lib/utils'
import type { CardTemplateProps } from '../types'
import { QrCode, Mail, Phone } from 'lucide-react'

export function GlassCard({ data, className, showQR = true }: CardTemplateProps) {
  return (
    <div 
      className={cn('w-[400px] h-[240px] rounded-xl overflow-hidden shadow-xl relative', className)}
      style={{ 
        background: `linear-gradient(135deg, ${data.theme_color || '#6366f1'}40, ${data.theme_color || '#6366f1'}20)`,
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255,255,255,0.2)'
      }}
    >
      <div className="h-full p-6 flex flex-col justify-between">
        <div>
          <h3 className="text-2xl font-bold text-white drop-shadow">{data.name || 'Your Name'}</h3>
          {data.title && <p className="text-white/90">{data.title}</p>}
          {data.company && <p className="text-white/70 text-sm mt-1">{data.company}</p>}
        </div>
        <div className="flex justify-between items-end">
          <div className="text-white/80 text-sm space-y-1">
            {data.email && (
              <p className="flex items-center gap-2">
                <Mail className="h-3 w-3" /> {data.email}
              </p>
            )}
            {data.phone && (
              <p className="flex items-center gap-2">
                <Phone className="h-3 w-3" /> {data.phone}
              </p>
            )}
          </div>
          {showQR && (
            <div className="w-14 h-14 bg-white/30 backdrop-blur rounded-lg p-1.5 flex items-center justify-center">
              <QrCode className="w-full h-full text-white" />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
