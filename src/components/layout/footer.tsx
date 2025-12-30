import Link from 'next/link'
import { FileText, Shield, Truck, Mail, RefreshCw } from 'lucide-react'

export function Footer() {
  const currentYear = new Date().getFullYear()

  const legalLinks = [
    { name: 'Terms and Conditions', href: '/terms', icon: FileText },
    { name: 'Privacy Policy', href: '/privacy', icon: Shield },
    { name: 'Shipping Policy', href: '/shipping', icon: Truck },
    { name: 'Cancellation & Refunds', href: '/refunds', icon: RefreshCw },
    { name: 'Contact Us', href: '/contact', icon: Mail },
  ]

  return (
    <footer className="border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 mt-auto">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div>
            <h3 className="font-bold text-lg bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent mb-2">
              ResumeAI
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              AI-powered resume builder and career tools to help you land your dream job.
            </p>
          </div>

          {/* Legal Links */}
          <div>
            <h4 className="font-semibold text-slate-800 dark:text-slate-200 mb-3">Legal</h4>
            <ul className="space-y-2">
              {legalLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-slate-600 dark:text-slate-400 hover:text-violet-600 dark:hover:text-violet-400 transition-colors flex items-center gap-2"
                  >
                    <link.icon className="h-3.5 w-3.5" />
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-slate-800 dark:text-slate-200 mb-3">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/dashboard" className="text-sm text-slate-600 dark:text-slate-400 hover:text-violet-600 dark:hover:text-violet-400 transition-colors">
                  Dashboard
                </Link>
              </li>
              <li>
                <Link href="/resumes" className="text-sm text-slate-600 dark:text-slate-400 hover:text-violet-600 dark:hover:text-violet-400 transition-colors">
                  My Resumes
                </Link>
              </li>
              <li>
                <Link href="/customize" className="text-sm text-slate-600 dark:text-slate-400 hover:text-violet-600 dark:hover:text-violet-400 transition-colors">
                  AI Customize
                </Link>
              </li>
              <li>
                <Link href="/interview" className="text-sm text-slate-600 dark:text-slate-400 hover:text-violet-600 dark:hover:text-violet-400 transition-colors">
                  Interview Prep
                </Link>
              </li>
              <li>
                <Link href="/salary" className="text-sm text-slate-600 dark:text-slate-400 hover:text-violet-600 dark:hover:text-violet-400 transition-colors">
                  Salary Guide
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-800">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-slate-600 dark:text-slate-400">
              © {currentYear} ResumeAI. All rights reserved.
            </p>
            <div className="flex items-center gap-4">
              <Link href="/terms" className="text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors">
                Terms
              </Link>
              <span className="text-slate-300 dark:text-slate-700">•</span>
              <Link href="/privacy" className="text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors">
                Privacy
              </Link>
              <span className="text-slate-300 dark:text-slate-700">•</span>
              <Link href="/contact" className="text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors">
                Contact
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
