'use client'

import { cn } from '@/lib/utils'
import type { CardTemplateProps } from '../types'
import { QrCode, Mail, Phone } from 'lucide-react'

export function GradientCard({ data, className, showQR = true }: CardTemplateProps) {
  const baseColor = data.theme_color || '#6366f1'
  
  return (
    <div 
      className={cn('w-[400px] h-[240px] rounded-xl p-6 flex flex-col justify-between text-white shadow-xl', className)}
      style={{ 
        background: `linear-gradient(135deg, ${baseColor} 0%, ${baseColor}99 50%, ${baseColor}66 100%)`
      }}
    >
      <div>
        <h3 className="text-3xl font-bold tracking-tight">{data.name || 'Your Name'}</h3>
        {data.title && <p className="text-white/90 font-medium mt-1">{data.title}</p>}
        {data.company && <p className="text-white/70 text-sm">{data.company}</p>}
      </div>
      <div className="flex justify-between items-end">
        <div className="text-white/90 text-sm space-y-1">
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
          <div className="w-14 h-14 bg-white/20 backdrop-blur rounded-lg p-1.5 flex items-center justify-center">
            <QrCode className="w-full h-full text-white" />
          </div>
        )}
      </div>
    </div>
  )
}
