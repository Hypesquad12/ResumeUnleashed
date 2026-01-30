
import { cn } from '@/lib/utils'
import type { CardTemplateProps } from '../types'
import { QrCode, Mail, Phone, Globe } from 'lucide-react'

export function VerticalCard({ data, className, showQR = true }: CardTemplateProps) {
  return (
    <div 
      className={cn('w-[400px] h-[240px] rounded-xl overflow-hidden shadow-xl flex', className)}
    >
      {/* Left side with info */}
      <div className="flex-1 bg-white p-5 flex flex-col justify-between">
        <div>
          <h3 className="text-xl font-bold text-gray-900">{data.name || 'Your Name'}</h3>
          {data.title && <p className="text-gray-600 text-sm">{data.title}</p>}
          {data.company && <p className="text-gray-400 text-xs mt-1">{data.company}</p>}
        </div>
        <div className="text-gray-600 text-xs space-y-1">
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
      </div>
      {/* Right side with color and QR */}
      <div 
        className="w-1/3 p-4 flex flex-col items-center justify-center"
        style={{ backgroundColor: data.theme_color || '#1a1a2e' }}
      >
        {showQR && (
          <div className="w-16 h-16 bg-white rounded-lg p-1.5 flex items-center justify-center">
            <QrCode className="w-full h-full text-gray-900" />
          </div>
        )}
      </div>
    </div>
  )
}
