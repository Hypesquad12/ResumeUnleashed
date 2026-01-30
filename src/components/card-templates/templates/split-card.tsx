
import { cn } from '@/lib/utils'
import type { CardTemplateProps } from '../types'
import { QrCode, Mail, Phone, Globe } from 'lucide-react'

export function SplitCard({ data, className, showQR = true }: CardTemplateProps) {
  return (
    <div 
      className={cn('w-[400px] h-[240px] rounded-xl overflow-hidden shadow-xl flex', className)}
    >
      {/* Left side - colored */}
      <div 
        className="w-1/3 p-4 flex flex-col justify-between text-white"
        style={{ backgroundColor: data.theme_color || '#1a1a2e' }}
      >
        <div>
          <h3 className="text-lg font-bold leading-tight">{data.name || 'Your Name'}</h3>
          {data.title && <p className="text-white/80 text-xs mt-1">{data.title}</p>}
        </div>
        {showQR && (
          <div className="w-12 h-12 bg-white rounded p-1 flex items-center justify-center">
            <QrCode className="w-full h-full text-gray-900" />
          </div>
        )}
      </div>
      {/* Right side - white */}
      <div className="flex-1 bg-white p-4 flex flex-col justify-center">
        {data.company && <p className="text-gray-900 font-semibold mb-3">{data.company}</p>}
        <div className="text-gray-600 text-sm space-y-2">
          {data.email && (
            <p className="flex items-center gap-2">
              <Mail className="h-4 w-4" style={{ color: data.theme_color }} /> {data.email}
            </p>
          )}
          {data.phone && (
            <p className="flex items-center gap-2">
              <Phone className="h-4 w-4" style={{ color: data.theme_color }} /> {data.phone}
            </p>
          )}
          {data.website && (
            <p className="flex items-center gap-2">
              <Globe className="h-4 w-4" style={{ color: data.theme_color }} /> {data.website}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
