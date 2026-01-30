
import { cn } from '@/lib/utils'
import type { CardTemplateProps } from '../types'
import { QrCode, Mail, Phone } from 'lucide-react'

export function CreativeCard({ data, className, showQR = true }: CardTemplateProps) {
  return (
    <div 
      className={cn('w-[400px] h-[240px] rounded-xl overflow-hidden shadow-xl relative', className)}
      style={{ backgroundColor: data.theme_color || '#ec4899' }}
    >
      {/* Decorative circles */}
      <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full bg-white/10" />
      <div className="absolute -bottom-5 -left-5 w-24 h-24 rounded-full bg-white/10" />
      
      <div className="relative h-full p-6 flex flex-col justify-between">
        <div>
          <h3 className="text-2xl font-bold text-white">{data.name || 'Your Name'}</h3>
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
            <div className="w-14 h-14 bg-white rounded-full p-2 flex items-center justify-center">
              <QrCode className="w-full h-full" style={{ color: data.theme_color || '#ec4899' }} />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
