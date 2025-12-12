'use client'

import { cn } from '@/lib/utils'
import type { CardTemplateProps } from '../types'
import { QrCode, Mail, Phone, Globe, Linkedin, Github } from 'lucide-react'

export function ClassicCard({ data, className, showQR = true }: CardTemplateProps) {
  return (
    <div 
      className={cn('w-[400px] h-[240px] rounded-xl p-6 flex flex-col justify-between text-white shadow-xl', className)}
      style={{ backgroundColor: data.theme_color || '#1a1a2e' }}
    >
      <div>
        <h3 className="text-2xl font-bold">{data.name || 'Your Name'}</h3>
        {data.title && <p className="text-white/80">{data.title}</p>}
        {data.company && <p className="text-white/60 text-sm mt-1">{data.company}</p>}
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
          {data.website && (
            <p className="flex items-center gap-2">
              <Globe className="h-3 w-3" /> {data.website}
            </p>
          )}
        </div>
        {showQR && (
          <div className="w-14 h-14 bg-white rounded-lg p-1.5 flex items-center justify-center">
            <QrCode className="w-full h-full text-slate-900" />
          </div>
        )}
      </div>
    </div>
  )
}
