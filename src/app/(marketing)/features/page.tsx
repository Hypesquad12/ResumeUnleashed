import { Navbar } from '@/components/landing/navbar'
import { FeaturesSection } from '@/components/landing/features-section'
import { Footer } from '@/components/landing/footer'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Features - AI-Powered Resume Builder | Resume Unleashed',
  description: 'Discover powerful features including AI customization, ATS optimization, multiple templates, and more to help you land your dream job.',
  keywords: 'resume features, AI resume, ATS optimization, resume templates, job matching, interview prep, digital business card',
  openGraph: {
    title: 'Features - AI-Powered Resume Builder | Resume Unleashed',
    description: 'Discover powerful features including AI customization, ATS optimization, multiple templates, and more.',
    url: 'https://resumeunleashed.com/features',
    type: 'website',
  },
  alternates: {
    canonical: 'https://resumeunleashed.com/features',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function FeaturesPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50">
      <Navbar />
      <main className="pt-16">
        <FeaturesSection />
      </main>
      <Footer />
    </div>
  )
}
