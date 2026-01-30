
import { cn } from '@/lib/utils'

interface TemplateThumbnailProps {
  templateId: string
  className?: string
}

// Mini preview components for each template style
export function TemplateThumbnail({ templateId, className }: TemplateThumbnailProps) {
  const thumbnails: Record<string, React.ReactNode> = {
    classic: <ClassicThumbnail />,
    professional: <ProfessionalThumbnail />,
    modern: <ModernThumbnail />,
    minimal: <MinimalThumbnail />,
    creative: <CreativeThumbnail />,
    executive: <ExecutiveThumbnail />,
    sleek: <SleekThumbnail />,
    tech: <TechThumbnail />,
    bold: <BoldThumbnail />,
    artistic: <ArtisticThumbnail />,
    clean: <CleanThumbnail />,
    elegant: <ElegantThumbnail />,
    corporate: <CorporateThumbnail />,
    premium: <PremiumThumbnail />,
    distinguished: <DistinguishedThumbnail />,
  }

  return (
    <div className={cn('w-full h-full', className)}>
      {thumbnails[templateId] || <ClassicThumbnail />}
    </div>
  )
}

// Classic - Traditional centered header
function ClassicThumbnail() {
  return (
    <div className="bg-white h-full w-full p-3 flex flex-col">
      <div className="text-center border-b-2 border-black pb-2 mb-2">
        <div className="h-3 w-20 bg-slate-800 rounded mx-auto mb-1" />
        <div className="flex justify-center gap-2">
          <div className="h-1 w-10 bg-slate-400 rounded" />
          <div className="h-1 w-10 bg-slate-400 rounded" />
        </div>
      </div>
      <div className="flex-1 space-y-2">
        <div className="h-1.5 w-16 bg-slate-600 rounded uppercase text-[6px]" />
        <div className="space-y-0.5">
          <div className="h-1 w-full bg-slate-200 rounded" />
          <div className="h-1 w-4/5 bg-slate-200 rounded" />
        </div>
        <div className="h-1.5 w-20 bg-slate-600 rounded" />
        <div className="space-y-0.5">
          <div className="h-1 w-full bg-slate-200 rounded" />
          <div className="h-1 w-3/4 bg-slate-200 rounded" />
        </div>
      </div>
    </div>
  )
}

// Professional - Blue accent with left border
function ProfessionalThumbnail() {
  return (
    <div className="bg-white h-full w-full p-3 flex flex-col">
      <div className="mb-2">
        <div className="h-3 w-20 bg-blue-800 rounded mb-1" />
        <div className="flex gap-2">
          <div className="h-1 w-12 bg-slate-400 rounded" />
          <div className="h-1 w-12 bg-slate-400 rounded" />
        </div>
      </div>
      <div className="h-1 bg-blue-800 mb-2" />
      <div className="flex-1 space-y-2">
        <div className="border-l-2 border-blue-800 pl-2">
          <div className="h-1.5 w-14 bg-slate-700 rounded mb-1" />
          <div className="space-y-0.5">
            <div className="h-1 w-full bg-slate-200 rounded" />
            <div className="h-1 w-4/5 bg-slate-200 rounded" />
          </div>
        </div>
        <div className="border-l-2 border-blue-800 pl-2">
          <div className="h-1.5 w-16 bg-slate-700 rounded mb-1" />
          <div className="flex gap-1">
            <div className="h-2 w-6 bg-blue-100 rounded" />
            <div className="h-2 w-8 bg-blue-100 rounded" />
          </div>
        </div>
      </div>
    </div>
  )
}

// Modern - Sidebar layout with teal
function ModernThumbnail() {
  return (
    <div className="h-full w-full flex">
      <div className="w-1/3 bg-teal-600 p-2 flex flex-col">
        <div className="w-6 h-6 bg-white/20 rounded-full mx-auto mb-2" />
        <div className="h-2 w-full bg-white/80 rounded mb-2" />
        <div className="space-y-1 flex-1">
          <div className="h-1 w-full bg-white/40 rounded" />
          <div className="h-1 w-4/5 bg-white/40 rounded" />
          <div className="h-1 w-full bg-white/40 rounded" />
        </div>
      </div>
      <div className="flex-1 bg-white p-2">
        <div className="h-1.5 w-12 bg-teal-600 rounded mb-1 border-b border-teal-600" />
        <div className="space-y-0.5 mb-2">
          <div className="h-1 w-full bg-slate-200 rounded" />
          <div className="h-1 w-3/4 bg-slate-200 rounded" />
        </div>
        <div className="h-1.5 w-14 bg-teal-600 rounded mb-1" />
        <div className="space-y-0.5">
          <div className="h-1 w-full bg-slate-200 rounded" />
          <div className="h-1 w-4/5 bg-slate-200 rounded" />
        </div>
      </div>
    </div>
  )
}

// Minimal - Clean with lots of whitespace
function MinimalThumbnail() {
  return (
    <div className="bg-white h-full w-full p-4 flex flex-col">
      <div className="mb-3">
        <div className="h-4 w-24 bg-slate-800 rounded mb-1" style={{ fontWeight: 300 }} />
        <div className="flex gap-2">
          <div className="h-1 w-14 bg-slate-400 rounded" />
          <div className="h-1 w-10 bg-slate-400 rounded" />
        </div>
      </div>
      <div className="flex-1 space-y-3">
        <div>
          <div className="h-1 w-12 bg-slate-300 rounded mb-1 uppercase" />
          <div className="space-y-0.5">
            <div className="h-1 w-full bg-slate-100 rounded" />
            <div className="h-1 w-3/4 bg-slate-100 rounded" />
          </div>
        </div>
        <div>
          <div className="h-1 w-10 bg-slate-300 rounded mb-1" />
          <div className="h-1 w-full bg-slate-100 rounded" />
        </div>
      </div>
    </div>
  )
}

// Creative - Purple/pink gradient header
function CreativeThumbnail() {
  return (
    <div className="h-full w-full flex flex-col">
      <div className="bg-gradient-to-r from-purple-600 to-pink-500 p-2">
        <div className="h-3 w-20 bg-white rounded mb-1" />
        <div className="flex gap-1">
          <div className="h-1 w-10 bg-white/70 rounded" />
          <div className="h-1 w-8 bg-white/70 rounded" />
        </div>
      </div>
      <div className="flex-1 bg-white p-2">
        <div className="bg-purple-50 rounded p-1 mb-2 border-l-2 border-purple-500">
          <div className="h-1 w-full bg-slate-300 rounded" />
        </div>
        <div className="grid grid-cols-3 gap-1">
          <div className="col-span-2 space-y-1">
            <div className="h-1.5 w-12 bg-purple-600 rounded" />
            <div className="h-1 w-full bg-slate-200 rounded" />
            <div className="h-1 w-3/4 bg-slate-200 rounded" />
          </div>
          <div className="bg-gray-50 rounded p-1">
            <div className="flex flex-wrap gap-0.5">
              <div className="h-2 w-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full" />
              <div className="h-2 w-5 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Executive - Amber/gold with serif style
function ExecutiveThumbnail() {
  return (
    <div className="h-full w-full flex flex-col">
      <div className="bg-amber-800 p-2">
        <div className="h-3 w-20 bg-white rounded mb-1" />
        <div className="flex gap-2">
          <div className="h-1 w-10 bg-amber-200 rounded" />
          <div className="h-1 w-8 bg-amber-200 rounded" />
        </div>
      </div>
      <div className="h-1 bg-gradient-to-r from-amber-400 to-amber-600" />
      <div className="flex-1 bg-white p-2 space-y-2">
        <div>
          <div className="h-1.5 w-16 bg-amber-800 rounded mb-1" />
          <div className="border-l-2 border-amber-400 pl-1">
            <div className="h-1 w-full bg-slate-200 rounded" />
          </div>
        </div>
        <div>
          <div className="h-1.5 w-20 bg-amber-800 rounded mb-1" />
          <div className="h-1 w-full bg-slate-200 rounded border-b border-amber-200 pb-1" />
        </div>
      </div>
    </div>
  )
}

// Sleek - Dark theme with gradient text
function SleekThumbnail() {
  return (
    <div className="bg-slate-900 h-full w-full p-2 flex flex-col">
      <div className="mb-2">
        <div className="h-4 w-24 bg-gradient-to-r from-indigo-400 to-purple-400 rounded mb-1" />
        <div className="flex gap-1">
          <div className="h-1 w-10 bg-slate-600 rounded" />
          <div className="h-1 w-8 bg-slate-600 rounded" />
        </div>
      </div>
      <div className="grid grid-cols-3 gap-2 flex-1">
        <div className="col-span-2 space-y-2">
          <div className="h-1.5 w-14 bg-indigo-400 rounded" />
          <div className="pl-1 border-l border-gradient-to-b from-indigo-500 to-purple-500">
            <div className="h-1 w-full bg-slate-700 rounded" />
            <div className="h-1 w-3/4 bg-slate-700 rounded mt-0.5" />
          </div>
        </div>
        <div className="bg-slate-800/50 rounded p-1">
          <div className="h-1.5 w-8 bg-indigo-400 rounded mb-1" />
          <div className="space-y-0.5">
            <div className="h-1 bg-slate-700 rounded-full" />
            <div className="h-1 bg-slate-700 rounded-full w-4/5" />
          </div>
        </div>
      </div>
    </div>
  )
}

// Tech - Terminal style
function TechThumbnail() {
  return (
    <div className="bg-gray-900 h-full w-full flex flex-col">
      <div className="bg-gray-800 p-1.5 border-b border-green-500/30">
        <div className="flex gap-1 mb-1">
          <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
          <div className="w-1.5 h-1.5 rounded-full bg-yellow-500" />
          <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
        </div>
        <div className="h-2 w-20 bg-green-400 rounded" />
      </div>
      <div className="flex-1 p-2 grid grid-cols-3 gap-1">
        <div className="col-span-2 space-y-1">
          <div className="h-1 w-8 bg-green-400 rounded" />
          <div className="bg-gray-800/50 rounded p-1 border border-gray-700">
            <div className="h-1 w-full bg-gray-600 rounded" />
            <div className="h-1 w-3/4 bg-gray-600 rounded mt-0.5" />
          </div>
        </div>
        <div className="bg-gray-800/50 rounded p-1 border border-gray-700">
          <div className="flex flex-wrap gap-0.5">
            <div className="h-2 w-4 bg-gray-700 border border-green-500/30 rounded text-[4px]" />
            <div className="h-2 w-5 bg-gray-700 border border-green-500/30 rounded" />
          </div>
        </div>
      </div>
    </div>
  )
}

// Bold - Red with strong typography
function BoldThumbnail() {
  return (
    <div className="h-full w-full flex flex-col">
      <div className="bg-red-600 p-2 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-8 h-8 bg-red-500 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="h-4 w-24 bg-white rounded mb-1 relative z-10" />
        <div className="flex gap-1 relative z-10">
          <div className="h-1 w-10 bg-white/80 rounded" />
          <div className="h-1 w-8 bg-white/80 rounded" />
        </div>
      </div>
      <div className="flex-1 bg-white p-2 space-y-2">
        <div className="h-2 w-16 bg-red-600 rounded" />
        <div className="border-l-4 border-red-600 pl-1">
          <div className="h-1.5 w-14 bg-slate-800 rounded" />
          <div className="h-1 w-full bg-slate-200 rounded mt-0.5" />
        </div>
        <div className="flex gap-1">
          <div className="h-2 w-6 bg-red-600 rounded" />
          <div className="h-2 w-8 bg-red-600 rounded" />
        </div>
      </div>
    </div>
  )
}

// Artistic - Gradient background with skill bars
function ArtisticThumbnail() {
  return (
    <div className="bg-gradient-to-br from-fuchsia-50 to-violet-50 h-full w-full p-3 flex flex-col">
      <div className="text-center mb-2">
        <div className="h-4 w-24 bg-gradient-to-r from-fuchsia-600 to-violet-600 rounded mx-auto mb-1" />
        <div className="flex justify-center gap-1">
          <div className="h-1 w-8 bg-slate-400 rounded" />
          <div className="h-1 w-8 bg-slate-400 rounded" />
        </div>
        <div className="w-8 h-0.5 bg-gradient-to-r from-fuchsia-400 to-violet-500 rounded-full mx-auto mt-1" />
      </div>
      <div className="grid grid-cols-5 gap-2 flex-1">
        <div className="col-span-3 space-y-1">
          <div className="h-1.5 w-12 bg-fuchsia-600 rounded" />
          <div className="h-1 w-full bg-slate-200 rounded" />
          <div className="h-1 w-3/4 bg-slate-200 rounded" />
        </div>
        <div className="col-span-2 bg-white/50 rounded-lg p-1">
          <div className="space-y-1">
            <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
              <div className="h-full w-4/5 bg-gradient-to-r from-fuchsia-400 to-violet-500 rounded-full" />
            </div>
            <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
              <div className="h-full w-3/5 bg-gradient-to-r from-fuchsia-400 to-violet-500 rounded-full" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Clean - Simple with subtle borders
function CleanThumbnail() {
  return (
    <div className="bg-white h-full w-full p-3 flex flex-col">
      <div className="mb-3">
        <div className="h-3 w-20 bg-slate-800 rounded mb-1" />
        <div className="flex gap-1">
          <div className="h-1 w-12 bg-slate-400 rounded" />
          <div className="h-1 w-10 bg-slate-400 rounded" />
        </div>
      </div>
      <div className="flex-1 space-y-2">
        <div>
          <div className="h-1 w-12 bg-slate-300 rounded mb-1 border-b pb-1" />
          <div className="space-y-0.5">
            <div className="h-1 w-full bg-slate-100 rounded" />
            <div className="h-1 w-4/5 bg-slate-100 rounded" />
          </div>
        </div>
        <div>
          <div className="h-1 w-10 bg-slate-300 rounded mb-1 border-b pb-1" />
          <div className="h-1 w-full bg-slate-100 rounded" />
        </div>
      </div>
    </div>
  )
}

// Elegant - Stone colors with centered sections
function ElegantThumbnail() {
  return (
    <div className="h-full w-full flex flex-col">
      <div className="bg-stone-800 p-2 text-center">
        <div className="h-3 w-20 bg-stone-100 rounded mx-auto mb-1" />
        <div className="flex justify-center gap-2">
          <div className="h-1 w-10 bg-stone-400 rounded" />
          <div className="h-1 w-8 bg-stone-400 rounded" />
        </div>
      </div>
      <div className="flex-1 bg-stone-50 p-2 space-y-2">
        <div className="flex items-center justify-center gap-1 mb-1">
          <div className="w-4 h-px bg-stone-300" />
          <div className="h-1 w-8 bg-stone-400 rounded" />
          <div className="w-4 h-px bg-stone-300" />
        </div>
        <div className="text-center">
          <div className="h-1.5 w-16 bg-stone-700 rounded mx-auto mb-0.5" />
          <div className="h-1 w-12 bg-stone-400 rounded mx-auto" />
        </div>
      </div>
    </div>
  )
}

// Corporate - Sky blue business style
function CorporateThumbnail() {
  return (
    <div className="h-full w-full flex flex-col">
      <div className="bg-sky-700 p-2">
        <div className="flex justify-between">
          <div>
            <div className="h-2.5 w-16 bg-white rounded mb-0.5" />
            <div className="h-1 w-20 bg-sky-200 rounded" />
          </div>
          <div className="text-right space-y-0.5">
            <div className="h-1 w-12 bg-white/80 rounded" />
            <div className="h-1 w-10 bg-white/80 rounded" />
          </div>
        </div>
      </div>
      <div className="flex-1 bg-white p-2 space-y-2">
        <div>
          <div className="h-1.5 w-20 bg-sky-700 rounded border-b-2 border-sky-700 pb-0.5 mb-1" />
          <div className="flex gap-0.5">
            <div className="text-sky-700">▸</div>
            <div className="h-1 w-full bg-slate-200 rounded" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-1">
          <div className="flex gap-0.5">
            <div className="text-sky-700 text-[6px]">▸</div>
            <div className="h-1 w-full bg-slate-200 rounded" />
          </div>
          <div className="flex gap-0.5">
            <div className="text-sky-700 text-[6px]">▸</div>
            <div className="h-1 w-full bg-slate-200 rounded" />
          </div>
        </div>
      </div>
    </div>
  )
}

// Premium - Amber/gold luxury
function PremiumThumbnail() {
  return (
    <div className="bg-gradient-to-br from-amber-50 to-orange-50 h-full w-full flex flex-col">
      <div className="bg-gradient-to-r from-amber-600 to-orange-500 p-2 relative">
        <div className="h-3 w-20 bg-white rounded mb-1" />
        <div className="flex gap-1">
          <div className="h-1 w-10 bg-amber-200 rounded" />
          <div className="h-1 w-8 bg-amber-200 rounded" />
        </div>
      </div>
      <div className="h-0.5 bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-400" />
      <div className="flex-1 p-2 space-y-2">
        <div className="flex items-center gap-1">
          <div className="w-2 h-0.5 bg-amber-500" />
          <div className="h-1.5 w-14 bg-amber-700 rounded" />
        </div>
        <div className="pl-3">
          <div className="h-1 w-full bg-slate-200 rounded border-b border-amber-200" />
        </div>
        <div className="flex gap-1">
          <div className="h-2 w-6 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full" />
          <div className="h-2 w-8 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full" />
        </div>
      </div>
    </div>
  )
}

// Distinguished - Emerald sidebar
function DistinguishedThumbnail() {
  return (
    <div className="h-full w-full flex">
      <div className="w-1/3 bg-gradient-to-b from-emerald-700 to-teal-800 p-2 flex flex-col">
        <div className="w-6 h-6 bg-white/10 rounded-full mx-auto mb-2 border border-white/30 flex items-center justify-center">
          <div className="text-white text-[6px]">AJ</div>
        </div>
        <div className="space-y-1 flex-1">
          <div className="h-1 w-full bg-emerald-200 rounded" />
          <div className="h-1 w-4/5 bg-emerald-300/50 rounded" />
          <div className="h-0.5 bg-emerald-900 rounded-full overflow-hidden mt-2">
            <div className="h-full w-4/5 bg-emerald-300 rounded-full" />
          </div>
        </div>
      </div>
      <div className="flex-1 bg-white p-2">
        <div className="border-b-2 border-emerald-600 pb-1 mb-2">
          <div className="h-3 w-20 bg-emerald-800 rounded" />
        </div>
        <div className="flex items-center gap-1 mb-1">
          <div className="w-3 h-0.5 bg-emerald-600" />
          <div className="h-1.5 w-16 bg-emerald-700 rounded" />
        </div>
        <div className="pl-2 relative">
          <div className="absolute left-0 top-0.5 w-1 h-1 bg-emerald-600 rounded-full" />
          <div className="h-1 w-full bg-slate-200 rounded" />
        </div>
      </div>
    </div>
  )
}
