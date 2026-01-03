'use client'

import { motion } from 'framer-motion'
import { FileText } from 'lucide-react'
import Link from 'next/link'

const footerLinks = {
  product: [
    { label: 'Features', href: '/features' },
    { label: 'Templates', href: '/templates' },
    { label: 'Pricing', href: '/pricing' },
    { label: 'Changelog', href: '/changelog' },
  ],
  resources: [
    { label: 'Blog', href: '/blog' },
    { label: 'Help Center', href: '/contact' },
    { label: 'Resume Tips', href: '/blog' },
    { label: 'Career Guide', href: '/blog' },
  ],
  company: [
    { label: 'Contact Us', href: '/contact' },
  ],
  legal: [
    { label: 'Terms and Conditions', href: '/terms' },
    { label: 'Privacy Policy', href: '/privacy' },
    { label: 'Shipping Policy', href: '/shipping' },
    { label: 'Cancellation & Refunds', href: '/refunds' },
  ],
}


export function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-2 md:grid-cols-6 gap-8">
          {/* Brand */}
          <div className="col-span-2">
            <Link href="/">
              <motion.div 
                className="flex items-center gap-2 mb-4"
                whileHover={{ scale: 1.05 }}
              >
                <img 
                  src="/images/logo.png" 
                  alt="Resume Unleashed Logo" 
                  className="h-8 w-auto"
                />
                <span className="font-bold text-lg text-slate-800">Resume Unleashed</span>
              </motion.div>
            </Link>
            <p className="text-slate-600 text-sm mb-4 max-w-xs">
              Build AI-powered resumes that get you hired. Stand out with professional templates and smart optimization.
            </p>
          </div>

          {/* Links */}
          <div>
            <h3 className="font-semibold text-slate-800 mb-4">Product</h3>
            <ul className="space-y-3">
              {footerLinks.product.map((link) => (
                <li key={link.label}>
                  <a href={link.href} className="text-sm text-slate-600 hover:text-slate-900 transition-colors">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-slate-800 mb-4">Resources</h3>
            <ul className="space-y-3">
              {footerLinks.resources.map((link) => (
                <li key={link.label}>
                  <a href={link.href} className="text-sm text-slate-600 hover:text-slate-900 transition-colors">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-slate-800 mb-4">Company</h3>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.label}>
                  <a href={link.href} className="text-sm text-slate-600 hover:text-slate-900 transition-colors">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-slate-800 mb-4">Legal</h3>
            <ul className="space-y-3">
              {footerLinks.legal.map((link) => (
                <li key={link.label}>
                  <a href={link.href} className="text-sm text-slate-600 hover:text-slate-900 transition-colors">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-16 pt-8 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-slate-500">
            © {new Date().getFullYear()} Resume Unleashed. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <Link href="/privacy" className="text-sm text-slate-500 hover:text-slate-700 transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms" className="text-sm text-slate-500 hover:text-slate-700 transition-colors">
              Terms of Service
            </Link>
            <Link href="/contact" className="text-sm text-slate-500 hover:text-slate-700 transition-colors">
              Contact
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
