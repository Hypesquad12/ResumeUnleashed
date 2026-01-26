import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL('https://resumeunleashed.com'),
  title: {
    default: "Free AI Resume Builder | Online Resume Maker | Resume Unleashed",
    template: "%s | Resume Unleashed"
  },
  description: "Create a professional, ATS-friendly resume in minutes with our free AI resume builder. Use our online resume maker to get a job-winning resume that lands interviews.",
  keywords: [
    "ai resume builder",
    "free resume builder",
    "resume maker",
    "online resume builder",
    "resume creator",
    "cv maker",
    "ats resume builder",
    "professional resume builder",
    "resume generator",
    "job-winning resume",
    "ats-friendly resume",
    "resume templates",
    "career platform",
    "interview prep",
    "job search tools"
  ],
  authors: [{ name: "Resume Unleashed" }],
  creator: "Resume Unleashed",
  publisher: "Resume Unleashed",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/images/logo.png', type: 'image/png', sizes: '192x192' },
    ],
    apple: [
      { url: '/images/logo.png', sizes: '180x180', type: 'image/png' },
    ],
    shortcut: '/favicon.ico',
  },
  openGraph: {
    title: "Resume Unleashed | #1 AI Resume Builder & Career Platform",
    description: "Build ATS-friendly resumes in minutes with AI. Resume Unleashed offers professional templates, AI-powered customization, job matching, and interview prep.",
    url: 'https://resumeunleashed.com',
    siteName: 'Resume Unleashed',
    images: [
      {
        url: '/images/og-image.png', // Assuming we'll add this or it maps to logo for now if needed, but safer to stick to what we have or generic
        width: 1200,
        height: 630,
        alt: 'Resume Unleashed - AI Career Platform',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: "Resume Unleashed | #1 AI Resume Builder",
    description: "Create professional, ATS-optimized resumes with AI. Get hired faster.",
    images: ['/images/og-image.png'],
    creator: '@ResumeUnleashed', // Placeholder
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* Google tag (gtag.js) */}
        <script async src="https://www.googletagmanager.com/gtag/js?id=AW-17885779962"></script>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'AW-17885779962');
            `
          }}
        />
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" type="image/png" href="/images/logo.png" />
        <link rel="apple-touch-icon" href="/images/logo.png" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://www.googletagmanager.com" />
        <script src="https://checkout.razorpay.com/v1/checkout.js"></script>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              "name": "Resume Unleashed",
              "url": "https://resumeunleashed.com",
              "logo": "https://resumeunleashed.com/images/logo.png",
              "sameAs": [
                "https://twitter.com/resumeunleashed",
                "https://www.linkedin.com/company/resume-unleashed",
                "https://www.facebook.com/resumeunleashed"
              ],
              "description": "AI-powered resume builder and career platform helping job seekers get hired faster."
            })
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
