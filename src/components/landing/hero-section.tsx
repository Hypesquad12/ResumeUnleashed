'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { ArrowRight, CheckCircle2, Shield, Clock, Star, Users, Zap, Play, FileText, Sparkles, Target } from 'lucide-react'
import Link from 'next/link'

// Animated counter for social proof stats
function AnimatedCounter({ end, duration = 2, suffix = '' }: { end: number; duration?: number; suffix?: string }) {
  const [count, setCount] = useState(0)
  
  useEffect(() => {
    let startTime: number
    let animationFrame: number
    
    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp
      const progress = Math.min((timestamp - startTime) / (duration * 1000), 1)
      const easeOut = 1 - Math.pow(1 - progress, 3)
      setCount(Math.floor(easeOut * end))
      
      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate)
      }
    }
    
    animationFrame = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(animationFrame)
  }, [end, duration])
  
  return <span>{count.toLocaleString()}{suffix}</span>
}

// Company logos for social proof
const companyLogos = [
  { name: 'Google', initial: 'G' },
  { name: 'Microsoft', initial: 'M' },
  { name: 'Amazon', initial: 'A' },
  { name: 'Meta', initial: 'F' },
  { name: 'Apple', initial: 'A' },
]

export function HeroSection() {
  return (
    <section className="relative pt-28 pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
      {/* Subtle animated background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-violet-200/40 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-200/40 rounded-full blur-3xl" />
      </div>

      <div className="max-w-6xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Column - Copy */}
          <div className="text-left">
            {/* Social proof badge - passes 5-second test */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-50 border border-emerald-200 mb-6"
            >
              <div className="flex -space-x-2">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="w-6 h-6 rounded-full bg-gradient-to-br from-slate-200 to-slate-300 border-2 border-white flex items-center justify-center text-[10px] font-bold text-slate-600">
                    {String.fromCharCode(65 + i)}
                  </div>
                ))}
              </div>
              <span className="text-sm text-emerald-700 font-medium">
                <AnimatedCounter end={10847} suffix="+" /> job seekers hired this month
              </span>
            </motion.div>

            {/* Compelling headline - benefit-focused */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold text-slate-900 tracking-tight leading-[1.1]"
            >
              Land Your Dream Job{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 animate-gradient">
                3x Faster
              </span>
              <br />
              <span className="text-slate-700 text-3xl sm:text-4xl lg:text-5xl">
                with AI-Powered Resumes
              </span>
            </motion.h1>

            {/* Benefit-driven subtitle with emotional hook */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mt-6 text-lg sm:text-xl text-slate-600 leading-relaxed max-w-2xl"
            >
              Transform your resume in <span className="font-bold text-violet-600">under 60 seconds</span> with AI that understands what recruiters want. 
              <span className="font-semibold text-slate-800"> Join 10,000+ professionals</span> who landed their dream jobs.
            </motion.p>

            {/* CTA with friction-reducing microcopy */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mt-8 space-y-4"
            >
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/signup" className="group">
                  <Button size="lg" className="w-full sm:w-auto text-base px-10 h-14 bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 hover:from-violet-700 hover:via-purple-700 hover:to-indigo-700 shadow-xl shadow-violet-500/30 text-white font-semibold transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-violet-500/40">
                    Get Started Free - No Credit Card
                    <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
                <Link href="#demo" className="group">
                  <Button size="lg" variant="outline" className="w-full sm:w-auto text-base px-8 h-14 border-2 border-slate-300 hover:border-violet-300 hover:bg-violet-50 transition-all duration-300">
                    <Play className="mr-2 h-5 w-5 group-hover:scale-110 transition-transform" />
                    Watch 60s Demo
                  </Button>
                </Link>
              </div>
              
              {/* Microcopy to reduce hesitation */}
              <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  No credit card required
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock className="h-4 w-4 text-emerald-500" />
                  Ready in 2 minutes
                </div>
                <div className="flex items-center gap-1.5">
                  <Shield className="h-4 w-4 text-emerald-500" />
                  Free forever plan
                </div>
              </div>
            </motion.div>

            {/* Specific social proof - company logos */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="mt-10 pt-8 border-t border-slate-200"
            >
              <p className="text-xs text-slate-500 uppercase tracking-wide font-medium mb-4">
                Our users landed jobs at
              </p>
              <div className="flex items-center gap-6">
                {companyLogos.map((company, i) => (
                  <motion.div
                    key={company.name}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 + i * 0.1 }}
                    className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400 font-bold text-lg hover:bg-slate-200 transition-colors"
                    title={company.name}
                  >
                    {company.initial}
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Right Column - Product Screenshot/Demo */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="relative"
          >
            {/* Main product mockup */}
            <div className="relative bg-white rounded-2xl shadow-2xl shadow-slate-200/50 border border-slate-200 overflow-hidden">
              {/* Browser chrome */}
              <div className="flex items-center gap-2 px-4 py-3 bg-slate-50 border-b border-slate-200">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-400" />
                  <div className="w-3 h-3 rounded-full bg-yellow-400" />
                  <div className="w-3 h-3 rounded-full bg-green-400" />
                </div>
                <div className="flex-1 mx-4">
                  <div className="bg-white rounded-lg px-3 py-1.5 text-xs text-slate-400 border border-slate-200">
                    resumeai.app/customize
                  </div>
                </div>
              </div>
              
              {/* App content mockup */}
              <div className="p-6 space-y-4">
                {/* Header */}
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center">
                    <Sparkles className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <div className="font-semibold text-slate-800">AI Resume Customization</div>
                    <div className="text-xs text-slate-500">Tailored for: Software Engineer at Google</div>
                  </div>
                </div>

                {/* Progress indicator */}
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-emerald-700">ATS Compatibility Score</span>
                    <span className="text-lg font-bold text-emerald-600">94%</span>
                  </div>
                  <div className="h-2 bg-emerald-100 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-to-r from-emerald-400 to-emerald-500 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: '94%' }}
                      transition={{ duration: 1.5, delay: 0.8 }}
                    />
                  </div>
                </div>

                {/* Keywords added */}
                <div>
                  <div className="text-xs text-slate-500 mb-2">Keywords optimized for this role:</div>
                  <div className="flex flex-wrap gap-2">
                    {['React', 'TypeScript', 'Node.js', 'System Design', 'CI/CD'].map((keyword, i) => (
                      <motion.span
                        key={keyword}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 1 + i * 0.1 }}
                        className="px-2.5 py-1 bg-violet-50 text-violet-700 text-xs font-medium rounded-lg border border-violet-200"
                      >
                        {keyword}
                      </motion.span>
                    ))}
                  </div>
                </div>

                {/* Action buttons */}
                <div className="flex gap-2 pt-2">
                  <div className="flex-1 h-9 bg-gradient-to-r from-violet-600 to-indigo-600 rounded-lg flex items-center justify-center text-white text-sm font-medium">
                    Download PDF
                  </div>
                  <div className="w-9 h-9 bg-slate-100 rounded-lg flex items-center justify-center">
                    <FileText className="h-4 w-4 text-slate-500" />
                  </div>
                </div>
              </div>
            </div>

            {/* Floating testimonial card */}
            <motion.div
              initial={{ opacity: 0, y: 20, x: -20 }}
              animate={{ opacity: 1, y: 0, x: 0 }}
              transition={{ delay: 1.2 }}
              className="absolute -bottom-6 -left-6 bg-white rounded-xl shadow-lg border border-slate-200 p-4 max-w-[240px]"
            >
              <div className="flex gap-0.5 mb-2">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 text-amber-400 fill-amber-400" />
                ))}
              </div>
              <p className="text-sm text-slate-600 mb-3">
                "Got 3 interview calls in my first week. The AI suggestions were spot on!"
              </p>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-400 to-indigo-500 flex items-center justify-center text-white text-xs font-bold">
                  SK
                </div>
                <div>
                  <div className="text-xs font-medium text-slate-800">Sarah K.</div>
                  <div className="text-xs text-slate-500">Product Designer</div>
                </div>
              </div>
            </motion.div>

            {/* Stats floating card */}
            <motion.div
              initial={{ opacity: 0, y: -20, x: 20 }}
              animate={{ opacity: 1, y: 0, x: 0 }}
              transition={{ delay: 1.4 }}
              className="absolute -top-4 -right-4 bg-white rounded-xl shadow-lg border border-slate-200 px-4 py-3"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
                  <Target className="h-5 w-5 text-emerald-600" />
                </div>
                <div>
                  <div className="text-xl font-bold text-slate-800">
                    <AnimatedCounter end={95} suffix="%" />
                  </div>
                  <div className="text-xs text-slate-500">ATS Pass Rate</div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
