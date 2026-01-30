import { lazy, Suspense } from 'react'
import { Navbar } from '@/components/landing/navbar'
import { HeroSection } from '@/components/landing/hero-section'

// Lazy load below-the-fold sections to reduce initial JS bundle
const StatsSection = lazy(() => import('@/components/landing/stats-section').then(mod => ({ default: mod.StatsSection })))
const FeaturesSection = lazy(() => import('@/components/landing/features-section').then(mod => ({ default: mod.FeaturesSection })))
const PreviewSection = lazy(() => import('@/components/landing/preview-section').then(mod => ({ default: mod.PreviewSection })))
const TestimonialsSection = lazy(() => import('@/components/landing/testimonials-section').then(mod => ({ default: mod.TestimonialsSection })))
const PricingSection = lazy(() => import('@/components/landing/pricing-section').then(mod => ({ default: mod.PricingSection })))
const CTASection = lazy(() => import('@/components/landing/cta-section').then(mod => ({ default: mod.CTASection })))
const Footer = lazy(() => import('@/components/landing/footer').then(mod => ({ default: mod.Footer })))

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 overflow-hidden">
      {/* Static background */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute w-[700px] h-[700px] bg-teal-200/40 dark:bg-teal-900/20 rounded-full blur-3xl -top-40 -left-40" />
        <div className="absolute w-[600px] h-[600px] bg-purple-200/30 dark:bg-purple-900/20 rounded-full blur-3xl top-1/3 -right-60" />
        <div className="absolute w-[500px] h-[500px] bg-cyan-200/30 dark:bg-cyan-900/20 rounded-full blur-3xl bottom-20 left-1/4" />
        <div className="absolute w-[400px] h-[400px] bg-rose-200/25 dark:bg-rose-900/20 rounded-full blur-3xl top-2/3 right-1/4" />
      </div>

      <Navbar />
      <HeroSection />
      <Suspense fallback={<div className="h-32" />}>
        <StatsSection />
      </Suspense>
      <Suspense fallback={<div className="h-96" />}>
        <FeaturesSection />
      </Suspense>
      <Suspense fallback={<div className="h-96" />}>
        <PreviewSection />
      </Suspense>
      <Suspense fallback={<div className="h-64" />}>
        <TestimonialsSection />
      </Suspense>
      <Suspense fallback={<div className="h-96" />}>
        <PricingSection />
      </Suspense>
      <Suspense fallback={<div className="h-48" />}>
        <CTASection />
      </Suspense>
      <Suspense fallback={<div className="h-64" />}>
        <Footer />
      </Suspense>
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
