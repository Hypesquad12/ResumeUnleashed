'use client'

import { cn } from '@/lib/utils'
import type { CardTemplateProps } from '../types'
import { QrCode, Mail, Phone } from 'lucide-react'

export function WaveCard({ data, className, showQR = true }: CardTemplateProps) {
  return (
    <div 
      className={cn('w-[400px] h-[240px] rounded-xl overflow-hidden shadow-xl relative bg-white', className)}
    >
      {/* Wave background */}
      <svg className="absolute bottom-0 left-0 w-full" viewBox="0 0 400 100" preserveAspectRatio="none">
        <path 
          d="M0,50 C100,80 200,20 300,50 C350,65 380,40 400,50 L400,100 L0,100 Z" 
          fill={data.theme_color || '#3b82f6'}
          opacity="0.9"
        />
        <path 
          d="M0,60 C80,90 180,30 280,60 C340,75 370,50 400,60 L400,100 L0,100 Z" 
          fill={data.theme_color || '#3b82f6'}
          opacity="0.6"
        />
      </svg>
      
      <div className="relative h-full p-6 flex flex-col justify-between">
        <div>
          <h3 className="text-2xl font-bold text-gray-900">{data.name || 'Your Name'}</h3>
          {data.title && <p className="text-gray-600">{data.title}</p>}
          {data.company && <p className="text-gray-400 text-sm mt-1">{data.company}</p>}
        </div>
        <div className="flex justify-between items-end relative z-10">
          <div className="text-white text-sm space-y-1">
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
            <div className="w-12 h-12 bg-white rounded-lg p-1 flex items-center justify-center shadow">
              <QrCode className="w-full h-full" style={{ color: data.theme_color || '#3b82f6' }} />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
