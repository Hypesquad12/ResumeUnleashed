
import { cn } from '@/lib/utils'
import type { CardTemplateProps } from '../types'
import { QrCode, Mail, Phone, Github, Linkedin } from 'lucide-react'

export function TechCard({ data, className, showQR = true }: CardTemplateProps) {
  return (
    <div 
      className={cn('w-[400px] h-[240px] rounded-xl bg-gray-900 p-6 flex flex-col justify-between shadow-xl border border-gray-800', className)}
    >
      <div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <span className="text-green-500 text-xs font-mono">available</span>
        </div>
        <h3 className="text-2xl font-mono font-bold text-white mt-2">{data.name || 'Your Name'}</h3>
        {data.title && <p className="text-cyan-400 font-mono text-sm">{`<${data.title} />`}</p>}
      </div>
      <div className="flex justify-between items-end">
        <div className="text-gray-400 text-sm font-mono space-y-1">
          {data.email && <p className="text-gray-300">{data.email}</p>}
          <div className="flex gap-3 mt-2">
            {data.github && <Github className="h-4 w-4 text-gray-400 hover:text-white cursor-pointer" />}
            {data.linkedin && <Linkedin className="h-4 w-4 text-gray-400 hover:text-white cursor-pointer" />}
          </div>
        </div>
        {showQR && (
          <div className="w-14 h-14 bg-gray-800 border border-gray-700 rounded p-1.5 flex items-center justify-center">
            <QrCode className="w-full h-full text-cyan-400" />
          </div>
        )}
      </div>
    </div>
  )
}
