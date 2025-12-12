'use client'

import { cn } from '@/lib/utils'
import type { CardTemplateProps } from '../types'
import { QrCode, Mail, Phone, Globe } from 'lucide-react'

export function CorporateCard({ data, className, showQR = true }: CardTemplateProps) {
  return (
    <div 
      className={cn('w-[400px] h-[240px] rounded-xl bg-white shadow-xl overflow-hidden', className)}
    >
      {/* Top accent */}
      <div className="h-2" style={{ backgroundColor: data.theme_color || '#1e40af' }} />
      <div className="p-5 flex flex-col justify-between h-[calc(100%-8px)]">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-xl font-bold text-gray-900">{data.name || 'Your Name'}</h3>
            {data.title && <p className="text-gray-600 text-sm">{data.title}</p>}
          </div>
          {data.company && (
            <div 
              className="px-3 py-1 rounded text-white text-xs font-semibold"
              style={{ backgroundColor: data.theme_color || '#1e40af' }}
            >
              {data.company}
            </div>
          )}
        </div>
        <div className="flex justify-between items-end">
          <div className="text-gray-600 text-sm space-y-1">
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
            <div className="w-12 h-12 border-2 rounded p-1 flex items-center justify-center" style={{ borderColor: data.theme_color || '#1e40af' }}>
              <QrCode className="w-full h-full" style={{ color: data.theme_color || '#1e40af' }} />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
