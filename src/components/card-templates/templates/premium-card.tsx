'use client'

import { cn } from '@/lib/utils'
import type { CardTemplateProps } from '../types'
import { QrCode, Mail, Phone, Globe } from 'lucide-react'

export function PremiumCard({ data, className, showQR = true }: CardTemplateProps) {
  return (
    <div 
      className={cn('w-[400px] h-[240px] rounded-xl overflow-hidden shadow-xl', className)}
      style={{ 
        background: `linear-gradient(145deg, #1a1a2e 0%, ${data.theme_color || '#2d2d44'} 50%, #1a1a2e 100%)`
      }}
    >
      {/* Gold accent line */}
      <div className="h-1 bg-gradient-to-r from-transparent via-amber-400 to-transparent" />
      <div className="p-5 flex flex-col justify-between h-[calc(100%-4px)]">
        <div>
          <h3 className="text-2xl font-bold text-white">{data.name || 'Your Name'}</h3>
          {data.title && <p className="text-amber-400 font-medium">{data.title}</p>}
          {data.company && <p className="text-gray-400 text-sm mt-1">{data.company}</p>}
        </div>
        <div className="flex justify-between items-end">
          <div className="text-gray-300 text-sm space-y-1">
            {data.email && (
              <p className="flex items-center gap-2">
                <Mail className="h-3 w-3 text-amber-400" /> {data.email}
              </p>
            )}
            {data.phone && (
              <p className="flex items-center gap-2">
                <Phone className="h-3 w-3 text-amber-400" /> {data.phone}
              </p>
            )}
          </div>
          {showQR && (
            <div className="w-14 h-14 bg-gradient-to-br from-amber-400 to-amber-600 rounded-lg p-1.5 flex items-center justify-center">
              <QrCode className="w-full h-full text-gray-900" />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
