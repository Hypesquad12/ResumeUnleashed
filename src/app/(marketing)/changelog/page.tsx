import { Navbar } from '@/components/landing/navbar'
import { Footer } from '@/components/landing/footer'
import type { Metadata } from 'next'
import { Calendar, CheckCircle2, Sparkles, Zap, Bug, ArrowUpCircle } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Changelog - Product Updates | ResumeAI',
  description: 'Stay updated with the latest features, improvements, and bug fixes in ResumeAI.',
  keywords: 'changelog, updates, new features, product updates',
}

const changelogEntries = [
  {
    version: '2.1.0',
    date: 'January 2, 2026',
    type: 'major',
    changes: [
      {
        type: 'feature',
        title: 'Region-Based Pricing',
        description: 'Automatic detection of user location to show relevant pricing (INR for India, USD for international)',
      },
      {
        type: 'feature',
        title: 'Performance Optimizations',
        description: 'Reduced main-thread work by 40% with lazy loading and CSS animations',
      },
      {
        type: 'improvement',
        title: 'Improved Geo-Detection',
        description: 'Enhanced IP-based location detection with timezone fallback',
      },
    ],
  },
  {
    version: '2.0.0',
    date: 'December 28, 2025',
    type: 'major',
    changes: [
      {
        type: 'feature',
        title: 'Razorpay Integration',
        description: 'Seamless subscription payments with Razorpay for Indian and international users',
      },
      {
        type: 'feature',
        title: 'Digital Visiting Cards',
        description: 'Create and share professional digital business cards with QR codes',
      },
      {
        type: 'feature',
        title: 'Interview Preparation',
        description: 'AI-powered interview prep with personalized questions and feedback',
      },
    ],
  },
  {
    version: '1.5.0',
    date: 'December 15, 2025',
    type: 'minor',
    changes: [
      {
        type: 'feature',
        title: 'Job Matching',
        description: 'Smart job matching algorithm to find relevant opportunities',
      },
      {
        type: 'improvement',
        title: 'Enhanced ATS Optimization',
        description: 'Improved keyword detection and formatting for better ATS compatibility',
      },
      {
        type: 'bug',
        title: 'Fixed PDF Export Issues',
        description: 'Resolved formatting issues in PDF exports for certain templates',
      },
    ],
  },
  {
    version: '1.0.0',
    date: 'November 1, 2025',
    type: 'major',
    changes: [
      {
        type: 'feature',
        title: 'AI Resume Customization',
        description: 'Launch of AI-powered resume customization based on job descriptions',
      },
      {
        type: 'feature',
        title: 'Professional Templates',
        description: 'Initial release with 25+ professional resume templates',
      },
      {
        type: 'feature',
        title: 'User Authentication',
        description: 'Secure authentication with Supabase Auth',
      },
    ],
  },
]

const getIcon = (type: string) => {
  switch (type) {
    case 'feature':
      return <Sparkles className="h-4 w-4 text-violet-600" />
    case 'improvement':
      return <ArrowUpCircle className="h-4 w-4 text-blue-600" />
    case 'bug':
      return <Bug className="h-4 w-4 text-red-600" />
    default:
      return <Zap className="h-4 w-4 text-slate-600" />
  }
}

const getTypeLabel = (type: string) => {
  switch (type) {
    case 'feature':
      return 'New Feature'
    case 'improvement':
      return 'Improvement'
    case 'bug':
      return 'Bug Fix'
    default:
      return 'Update'
  }
}

export default function ChangelogPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50">
      <Navbar />
      <main className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16">
            <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 mb-4">
              Changelog
            </h1>
            <p className="text-lg text-slate-600">
              Stay updated with the latest features, improvements, and bug fixes
            </p>
          </div>

          {/* Timeline */}
          <div className="space-y-12">
            {changelogEntries.map((entry, index) => (
              <div key={entry.version} className="relative">
                {/* Timeline line */}
                {index !== changelogEntries.length - 1 && (
                  <div className="absolute left-6 top-16 bottom-0 w-0.5 bg-slate-200" />
                )}

                {/* Entry */}
                <div className="relative">
                  {/* Version badge */}
                  <div className="flex items-center gap-4 mb-4">
                    <div className="flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br from-violet-600 to-indigo-600 text-white font-bold shadow-lg">
                      <CheckCircle2 className="h-6 w-6" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-slate-900">
                        Version {entry.version}
                      </h2>
                      <div className="flex items-center gap-2 text-sm text-slate-500">
                        <Calendar className="h-4 w-4" />
                        {entry.date}
                      </div>
                    </div>
                  </div>

                  {/* Changes */}
                  <div className="ml-16 space-y-4">
                    {entry.changes.map((change, changeIndex) => (
                      <div
                        key={changeIndex}
                        className="bg-white rounded-lg border border-slate-200 p-4 hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-start gap-3">
                          <div className="mt-0.5">{getIcon(change.type)}</div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                                {getTypeLabel(change.type)}
                              </span>
                            </div>
                            <h3 className="font-semibold text-slate-900 mb-1">
                              {change.title}
                            </h3>
                            <p className="text-sm text-slate-600">
                              {change.description}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Footer CTA */}
          <div className="mt-16 text-center">
            <div className="inline-flex items-center gap-2 px-6 py-3 bg-violet-50 border border-violet-200 rounded-full">
              <Sparkles className="h-5 w-5 text-violet-600" />
              <span className="text-sm font-medium text-violet-700">
                More exciting features coming soon!
              </span>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
