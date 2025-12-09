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
      {/* Animated background */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute w-[600px] h-[600px] bg-blue-500/15 rounded-full blur-3xl -top-40 -left-40 animate-pulse" />
        <div className="absolute w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-3xl top-1/2 -right-40 animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute w-[400px] h-[400px] bg-cyan-500/10 rounded-full blur-3xl bottom-0 left-1/3 animate-pulse" style={{ animationDelay: '2s' }} />
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
