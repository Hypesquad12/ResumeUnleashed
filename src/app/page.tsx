import dynamic from 'next/dynamic'
import { Navbar } from '@/components/landing/navbar'
import { HeroSection } from '@/components/landing/hero-section'

// Lazy load below-the-fold sections to reduce initial JS bundle
const StatsSection = dynamic(() => import('@/components/landing/stats-section').then(mod => mod.StatsSection), {
  loading: () => <div className="h-32" />,
})
const FeaturesSection = dynamic(() => import('@/components/landing/features-section').then(mod => mod.FeaturesSection), {
  loading: () => <div className="h-96" />,
})
const PreviewSection = dynamic(() => import('@/components/landing/preview-section').then(mod => mod.PreviewSection), {
  loading: () => <div className="h-96" />,
})
const TestimonialsSection = dynamic(() => import('@/components/landing/testimonials-section').then(mod => mod.TestimonialsSection), {
  loading: () => <div className="h-64" />,
})
const PricingSection = dynamic(() => import('@/components/landing/pricing-section').then(mod => mod.PricingSection), {
  loading: () => <div className="h-96" />,
})
const CTASection = dynamic(() => import('@/components/landing/cta-section').then(mod => mod.CTASection), {
  loading: () => <div className="h-48" />,
})
const Footer = dynamic(() => import('@/components/landing/footer').then(mod => mod.Footer), {
  loading: () => <div className="h-64" />,
})

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50 overflow-hidden">
      {/* Static background - removed animate-pulse for performance */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute w-[700px] h-[700px] bg-teal-200/40 rounded-full blur-3xl -top-40 -left-40" />
        <div className="absolute w-[600px] h-[600px] bg-purple-200/30 rounded-full blur-3xl top-1/3 -right-60" />
        <div className="absolute w-[500px] h-[500px] bg-cyan-200/30 rounded-full blur-3xl bottom-20 left-1/4" />
        <div className="absolute w-[400px] h-[400px] bg-rose-200/25 rounded-full blur-3xl top-2/3 right-1/4" />
      </div>

      <Navbar />
      <HeroSection />
      <StatsSection />
      <FeaturesSection />
      <PreviewSection />
      <TestimonialsSection />
      <PricingSection />
      <CTASection />
      <Footer />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            "name": "Resume Unleashed - AI Resume Builder",
            "applicationCategory": "BusinessApplication",
            "operatingSystem": "Web",
            "offers": {
              "@type": "Offer",
              "price": "0",
              "priceCurrency": "USD"
            },
            "aggregateRating": {
              "@type": "AggregateRating",
              "ratingValue": "4.8",
              "reviewCount": "1250"
            },
            "description": "Build a job-winning resume in minutes with our free AI resume builder. Our online resume maker is designed to create professional, ATS-friendly resumes that land interviews.",
            "featureList": "AI Resume Builder, ATS Resume Templates, Free Resume Maker, CV Maker, Interview Prep, Job Search Tools",
            "screenshot": "https://resumeunleashed.com/images/og-image.png",
            "creator": {
              "@type": "Organization",
              "name": "Resume Unleashed"
            }
          })
        }}
      />
    </div>
  )
}
