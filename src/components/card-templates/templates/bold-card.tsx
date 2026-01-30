
import { cn } from '@/lib/utils'
import type { CardTemplateProps } from '../types'
import { QrCode, Mail, Phone } from 'lucide-react'

export function BoldCard({ data, className, showQR = true }: CardTemplateProps) {
  return (
    <div 
      className={cn('w-[400px] h-[240px] rounded-xl overflow-hidden shadow-xl', className)}
      style={{ backgroundColor: data.theme_color || '#000' }}
    >
      <div className="h-full p-6 flex flex-col justify-between">
        <div>
          <h3 className="text-4xl font-black text-white uppercase tracking-tight">{data.name || 'Your Name'}</h3>
          {data.title && <p className="text-white/80 font-bold mt-2">{data.title}</p>}
        </div>
        <div className="flex justify-between items-end">
          <div className="text-white/70 text-sm space-y-1">
            {data.company && <p className="font-semibold text-white">{data.company}</p>}
            {data.email && <p>{data.email}</p>}
            {data.phone && <p>{data.phone}</p>}
          </div>
          {showQR && (
            <div className="w-14 h-14 bg-white rounded p-1 flex items-center justify-center">
              <QrCode className="w-full h-full" style={{ color: data.theme_color || '#000' }} />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
