import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Pricing Plans | Resume Unleashed - Affordable Resume Building',
  description: 'Choose the perfect plan for your career journey. Transparent pricing for AI resume building, interview prep, and more. Start with a free trial.',
  keywords: 'resume builder pricing, resume maker cost, free resume builder trial, premium resume templates, career services pricing',
  openGraph: {
    title: 'Pricing Plans | Resume Unleashed',
    description: 'Choose the perfect plan for your career journey. Transparent pricing with free trials.',
    url: 'https://resumeunleashed.com/pricing',
    type: 'website',
  },
  alternates: {
    canonical: 'https://resumeunleashed.com/pricing',
  },
}

export default function PricingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
