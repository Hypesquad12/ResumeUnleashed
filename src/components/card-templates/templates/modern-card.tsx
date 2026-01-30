
import { cn } from '@/lib/utils'
import type { CardTemplateProps } from '../types'
import { QrCode, Mail, Phone, Globe, Linkedin, Github } from 'lucide-react'

export function ModernCard({ data, className, showQR = true }: CardTemplateProps) {
  return (
    <div 
      className={cn('w-[400px] h-[240px] rounded-xl overflow-hidden shadow-xl flex', className)}
    >
      {/* Left accent bar */}
      <div 
        className="w-2"
        style={{ backgroundColor: data.theme_color || '#6366f1' }}
      />
      <div className="flex-1 bg-white p-6 flex flex-col justify-between">
        <div>
          <h3 className="text-2xl font-bold text-gray-900">{data.name || 'Your Name'}</h3>
          {data.title && <p className="text-gray-600 font-medium">{data.title}</p>}
          {data.company && <p className="text-gray-400 text-sm mt-1">{data.company}</p>}
        </div>
        <div className="flex justify-between items-end">
          <div className="text-gray-600 text-sm space-y-1">
            {data.email && (
              <p className="flex items-center gap-2">
                <Mail className="h-3 w-3" style={{ color: data.theme_color }} /> {data.email}
              </p>
            )}
            {data.phone && (
              <p className="flex items-center gap-2">
                <Phone className="h-3 w-3" style={{ color: data.theme_color }} /> {data.phone}
              </p>
            )}
          </div>
          {showQR && (
            <div 
              className="w-14 h-14 rounded-lg p-1.5 flex items-center justify-center"
              style={{ backgroundColor: data.theme_color || '#6366f1' }}
            >
              <QrCode className="w-full h-full text-white" />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
