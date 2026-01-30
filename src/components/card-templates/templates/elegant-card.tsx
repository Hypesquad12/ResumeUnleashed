
import { cn } from '@/lib/utils'
import type { CardTemplateProps } from '../types'
import { QrCode, Mail, Phone } from 'lucide-react'

export function ElegantCard({ data, className, showQR = true }: CardTemplateProps) {
  return (
    <div 
      className={cn('w-[400px] h-[240px] rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200 p-6 flex flex-col justify-between shadow-lg', className)}
    >
      <div className="text-center">
        <h3 className="text-2xl font-serif text-gray-900">{data.name || 'Your Name'}</h3>
        <div className="flex items-center justify-center gap-4 mt-2">
          <div className="h-px w-8 bg-gray-300" />
          {data.title && <p className="text-gray-600 text-sm italic">{data.title}</p>}
          <div className="h-px w-8 bg-gray-300" />
        </div>
        {data.company && <p className="text-gray-500 text-xs mt-1 uppercase tracking-wider">{data.company}</p>}
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
        </div>
        {showQR && (
          <div 
            className="w-14 h-14 rounded-lg p-1.5 flex items-center justify-center"
            style={{ backgroundColor: data.theme_color || '#374151' }}
          >
            <QrCode className="w-full h-full text-white" />
          </div>
        )}
      </div>
    </div>
  )
}
