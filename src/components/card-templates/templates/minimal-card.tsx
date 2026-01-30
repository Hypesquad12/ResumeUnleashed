
import { cn } from '@/lib/utils'
import type { CardTemplateProps } from '../types'
import { QrCode } from 'lucide-react'

export function MinimalCard({ data, className, showQR = true }: CardTemplateProps) {
  return (
    <div 
      className={cn('w-[400px] h-[240px] rounded-xl bg-white border border-gray-200 p-6 flex flex-col justify-between shadow-sm', className)}
    >
      <div>
        <h3 className="text-2xl font-light text-gray-900">{data.name || 'Your Name'}</h3>
        <div className="h-px w-12 mt-2 mb-3" style={{ backgroundColor: data.theme_color || '#000' }} />
        {data.title && <p className="text-gray-600">{data.title}</p>}
        {data.company && <p className="text-gray-400 text-sm">{data.company}</p>}
      </div>
      <div className="flex justify-between items-end">
        <div className="text-gray-500 text-sm space-y-0.5">
          {data.email && <p>{data.email}</p>}
          {data.phone && <p>{data.phone}</p>}
        </div>
        {showQR && (
          <div className="w-12 h-12 border border-gray-200 rounded p-1 flex items-center justify-center">
            <QrCode className="w-full h-full text-gray-400" />
          </div>
        )}
      </div>
    </div>
  )
}
