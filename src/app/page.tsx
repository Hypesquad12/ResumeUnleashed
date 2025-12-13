import { Navbar } from '@/components/landing/navbar'
import { HeroSection } from '@/components/landing/hero-section'
import { FeaturesSection } from '@/components/landing/features-section'
import { PreviewSection } from '@/components/landing/preview-section'
import { GameSection } from '@/components/landing/game-section'
import { TestimonialsSection } from '@/components/landing/testimonials-section'
import { CTASection } from '@/components/landing/cta-section'
import { Footer } from '@/components/landing/footer'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50 overflow-hidden">
      {/* Animated background - Soft light gradient orbs */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute w-[700px] h-[700px] bg-teal-200/40 rounded-full blur-3xl -top-40 -left-40 animate-pulse" />
        <div className="absolute w-[600px] h-[600px] bg-purple-200/30 rounded-full blur-3xl top-1/3 -right-60 animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute w-[500px] h-[500px] bg-cyan-200/30 rounded-full blur-3xl bottom-20 left-1/4 animate-pulse" style={{ animationDelay: '2s' }} />
        <div className="absolute w-[400px] h-[400px] bg-rose-200/25 rounded-full blur-3xl top-2/3 right-1/4 animate-pulse" style={{ animationDelay: '3s' }} />
      </div>

      <Navbar />
      <HeroSection />
      <FeaturesSection />
      <PreviewSection />
      <GameSection />
      <TestimonialsSection />
      <CTASection />
      <Footer />
    </div>
  )
}
