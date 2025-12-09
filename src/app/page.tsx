import { Navbar } from '@/components/landing/navbar'
import { HeroSection } from '@/components/landing/hero-section'
import { FeaturesSection } from '@/components/landing/features-section'
import { PreviewSection } from '@/components/landing/preview-section'
import { TestimonialsSection } from '@/components/landing/testimonials-section'
import { CTASection } from '@/components/landing/cta-section'
import { Footer } from '@/components/landing/footer'

export default function Home() {
  return (
    <div className="min-h-screen bg-[#0a0a0f] overflow-hidden">
      {/* Animated background - Soothing gradient orbs */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute w-[700px] h-[700px] bg-teal-500/10 rounded-full blur-3xl -top-40 -left-40 animate-pulse" />
        <div className="absolute w-[600px] h-[600px] bg-purple-400/8 rounded-full blur-3xl top-1/3 -right-60 animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute w-[500px] h-[500px] bg-cyan-400/8 rounded-full blur-3xl bottom-20 left-1/4 animate-pulse" style={{ animationDelay: '2s' }} />
        <div className="absolute w-[400px] h-[400px] bg-rose-400/5 rounded-full blur-3xl top-2/3 right-1/4 animate-pulse" style={{ animationDelay: '3s' }} />
      </div>

      <Navbar />
      <HeroSection />
      <FeaturesSection />
      <PreviewSection />
      <TestimonialsSection />
      <CTASection />
      <Footer />
    </div>
  )
}
