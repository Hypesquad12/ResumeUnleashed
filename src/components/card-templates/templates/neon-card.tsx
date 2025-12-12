'use client'

import { cn } from '@/lib/utils'
import type { CardTemplateProps } from '../types'
import { QrCode, Mail, Phone } from 'lucide-react'

export function NeonCard({ data, className, showQR = true }: CardTemplateProps) {
  const neonColor = data.theme_color || '#00ff88'
  
  return (
    <div 
      className={cn('w-[400px] h-[240px] rounded-xl bg-gray-950 p-6 flex flex-col justify-between shadow-xl relative overflow-hidden', className)}
      style={{ 
        boxShadow: `0 0 20px ${neonColor}40, inset 0 0 20px ${neonColor}10`
      }}
    >
      {/* Neon border effect */}
      <div 
        className="absolute inset-0 rounded-xl pointer-events-none"
        style={{ 
          border: `1px solid ${neonColor}`,
          boxShadow: `inset 0 0 10px ${neonColor}30`
        }}
      />
      
      <div className="relative">
        <h3 className="text-2xl font-bold" style={{ color: neonColor }}>{data.name || 'Your Name'}</h3>
        {data.title && <p className="text-gray-400">{data.title}</p>}
        {data.company && <p className="text-gray-500 text-sm mt-1">{data.company}</p>}
      </div>
      <div className="relative flex justify-between items-end">
        <div className="text-gray-400 text-sm space-y-1">
          {data.email && (
            <p className="flex items-center gap-2">
              <Mail className="h-3 w-3" style={{ color: neonColor }} /> {data.email}
            </p>
          )}
          {data.phone && (
            <p className="flex items-center gap-2">
              <Phone className="h-3 w-3" style={{ color: neonColor }} /> {data.phone}
            </p>
          )}
        </div>
        {showQR && (
          <div 
            className="w-14 h-14 rounded-lg p-1.5 flex items-center justify-center"
            style={{ 
              backgroundColor: `${neonColor}20`,
              border: `1px solid ${neonColor}`
            }}
          >
            <QrCode className="w-full h-full" style={{ color: neonColor }} />
          </div>
        )}
      </div>
    </div>
  )
}
