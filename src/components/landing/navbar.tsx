'use client'

import { motion, useScroll, useTransform } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { FileText, Menu, X } from 'lucide-react'
import Link from 'next/link'
import { useState, useEffect } from 'react'

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const { scrollY } = useScroll()
  
  useEffect(() => {
    const unsubscribe = scrollY.on('change', (latest) => {
      setIsScrolled(latest > 50)
    })
    return () => unsubscribe()
  }, [scrollY])

  const navItems = [
    { label: 'Features', href: '#features' },
    { label: 'Templates', href: '/templates' },
    { label: 'Pricing', href: '#pricing' },
  ]

  return (
    <>
      <motion.nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled 
            ? 'bg-[#0a0a0f]/90 backdrop-blur-xl border-b border-white/5' 
            : 'bg-transparent'
        }`}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/">
              <motion.div 
                className="flex items-center gap-2"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <div className="p-1.5 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-lg shadow-lg shadow-blue-500/25">
                  <FileText className="h-5 w-5 text-white" />
                </div>
                <span className="font-bold text-lg text-white">ResumeAI</span>
              </motion.div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-8">
              {navItems.map((item) => (
                <motion.a
                  key={item.label}
                  href={item.href}
                  className="text-slate-400 hover:text-white transition-colors text-sm font-medium relative group"
                  whileHover={{ y: -2 }}
                >
                  {item.label}
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-500 to-indigo-500 group-hover:w-full transition-all duration-300" />
                </motion.a>
              ))}
            </div>

            {/* Desktop CTA */}
            <div className="hidden md:flex items-center gap-3">
              <Link href="/login">
                <Button variant="ghost" className="text-slate-300 hover:text-white hover:bg-white/10">
                  Sign In
                </Button>
              </Link>
              <Link href="/signup">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 shadow-lg shadow-blue-500/25 border-0">
                    Get Started
                  </Button>
                </motion.div>
              </Link>
            </div>

            {/* Mobile menu button */}
            <button
              className="md:hidden p-2 text-white"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </motion.nav>

      {/* Mobile Menu */}
      <motion.div
        className={`fixed inset-0 z-40 md:hidden ${isMobileMenuOpen ? 'pointer-events-auto' : 'pointer-events-none'}`}
        initial={false}
      >
        {/* Backdrop */}
        <motion.div
          className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: isMobileMenuOpen ? 1 : 0 }}
          transition={{ duration: 0.3 }}
          onClick={() => setIsMobileMenuOpen(false)}
        />

        {/* Menu content */}
        <motion.div
          className="absolute top-16 left-0 right-0 bg-[#0a0a0f] border-b border-white/10 p-6"
          initial={{ opacity: 0, y: -20 }}
          animate={{ 
            opacity: isMobileMenuOpen ? 1 : 0, 
            y: isMobileMenuOpen ? 0 : -20 
          }}
          transition={{ duration: 0.3 }}
        >
          <div className="space-y-4">
            {navItems.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className="block text-lg text-slate-300 hover:text-white py-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {item.label}
              </a>
            ))}
            <div className="pt-4 border-t border-white/10 space-y-3">
              <Link href="/login" className="block">
                <Button variant="outline" className="w-full border-white/20 text-white">
                  Sign In
                </Button>
              </Link>
              <Link href="/signup" className="block">
                <Button className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 border-0">
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </>
  )
}
