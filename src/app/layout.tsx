import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { GoogleAnalytics } from "@/components/analytics/google-analytics";
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
    default: "Resume Unleashed | #1 AI Resume Builder & Career Platform",
    template: "%s | Resume Unleashed"
  },
  description: "Build ATS-friendly resumes in minutes with AI. Resume Unleashed offers professional templates, AI-powered customization, job matching, and interview prep to help you get hired faster.",
  keywords: [
    "resume ai",
    "ats optimisation",
    "ai resume builder free",
    "resume maker ai",
    "cv maker ai",
    "resume generator ai",
    "ai resume creator",
    "artificial intelligence resume",
    "ai interview",
    "interview with ai",
    "AI resume builder",
    "resume customization",
    "ATS resume templates",
    "CV maker",
    "job interview prep",
    "career tools",
    "resume unleashed",
    "free resume builder",
    "AI cover letter generator"
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
      { url: '/favicon.ico' },
      { url: '/images/logo.png', type: 'image/png' },
    ],
    apple: '/images/logo.png',
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
        {/* Google Tag Manager */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','GTM-M29CFSBQ');`
          }}
        />
        {/* End Google Tag Manager */}
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
        <GoogleAnalytics />
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
