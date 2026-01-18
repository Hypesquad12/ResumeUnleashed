import { Metadata } from 'next'
import { ContactClient } from './contact-client'

export const metadata: Metadata = {
  title: 'Contact Us | Resume Unleashed',
  description: 'Get in touch with the Resume Unleashed team. We are here to help with any questions about our resume builder, pricing, or account support.',
  keywords: 'contact resume unleashed, customer support, resume builder help, support team',
  openGraph: {
    title: 'Contact Us | Resume Unleashed',
    description: 'Get in touch with the Resume Unleashed team for support and inquiries.',
    url: 'https://resumeunleashed.com/contact',
    type: 'website',
  },
  alternates: {
    canonical: 'https://resumeunleashed.com/contact',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function ContactPage() {
  return <ContactClient />
}
