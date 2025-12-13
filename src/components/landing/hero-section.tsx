'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { ArrowRight, Play, X, Trophy, Star, Zap, Target, Award, Flame, Crown, Sparkles, TrendingUp, CheckCircle2 } from 'lucide-react'
import Link from 'next/link'

// Animated counter component
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

// Floating achievement badge
function AchievementBadge({ icon: Icon, label, color, delay }: { icon: React.ElementType; label: string; color: string; delay: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ delay, type: 'spring', stiffness: 200 }}
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${color} shadow-lg`}
    >
      <Icon className="h-3.5 w-3.5" />
      {label}
    </motion.div>
  )
}

function DemoModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
          
          <div className="p-6">
            <h2 className="text-2xl font-bold text-slate-800 mb-4">How It Works</h2>
            
            <div className="aspect-video bg-gradient-to-br from-slate-100 to-slate-200 rounded-xl overflow-hidden">
              <div className="w-full h-full flex flex-col items-center justify-center p-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-3xl">
                  <div className="text-center p-4">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-teal-400 to-cyan-500 flex items-center justify-center text-white text-2xl font-bold">
                      1
                    </div>
                    <h3 className="font-semibold text-slate-800 mb-2">Upload Resume</h3>
                    <p className="text-sm text-slate-600">Upload your existing resume or start from scratch</p>
                  </div>
                  <div className="text-center p-4">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-purple-400 to-violet-500 flex items-center justify-center text-white text-2xl font-bold">
                      2
                    </div>
                    <h3 className="font-semibold text-slate-800 mb-2">AI Customization</h3>
                    <p className="text-sm text-slate-600">Paste a job description and let AI optimize your resume</p>
                  </div>
                  <div className="text-center p-4">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-orange-400 to-rose-500 flex items-center justify-center text-white text-2xl font-bold">
                      3
                    </div>
                    <h3 className="font-semibold text-slate-800 mb-2">Share & Apply</h3>
                    <p className="text-sm text-slate-600">Download, share via QR code, or apply directly</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/signup">
                <Button size="lg" className="w-full sm:w-auto bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white">
                  Get Started Free
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Button size="lg" variant="outline" onClick={onClose}>
                Maybe Later
              </Button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

export function HeroSection() {
  const [showDemo, setShowDemo] = useState(false)
  const [xpGained, setXpGained] = useState(false)
  const [streakCount, setStreakCount] = useState(7)

  // Simulate XP gain on mount
  useEffect(() => {
    const timer = setTimeout(() => setXpGained(true), 1500)
    return () => clearTimeout(timer)
  }, [])

  return (
    <section className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
      {/* Animated gradient orbs - Light theme */}
      <motion.div
        className="absolute top-20 -left-40 w-[500px] h-[500px] bg-teal-300/30 rounded-full blur-3xl"
        animate={{ scale: [1, 1.15, 1], opacity: [0.3, 0.5, 0.3] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute top-40 -right-40 w-[400px] h-[400px] bg-purple-300/25 rounded-full blur-3xl"
        animate={{ scale: [1.1, 1, 1.1], opacity: [0.25, 0.4, 0.25] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute -bottom-20 left-1/3 w-[350px] h-[350px] bg-cyan-300/25 rounded-full blur-3xl"
        animate={{ scale: [1, 1.2, 1], opacity: [0.25, 0.4, 0.25] }}
        transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Floating particles */}
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 rounded-full bg-gradient-to-r from-teal-400 to-cyan-400"
          style={{
            left: `${15 + i * 15}%`,
            top: `${20 + (i % 3) * 20}%`,
          }}
          animate={{
            y: [0, -30, 0],
            opacity: [0.3, 0.8, 0.3],
            scale: [1, 1.5, 1],
          }}
          transition={{
            duration: 3 + i * 0.5,
            repeat: Infinity,
            delay: i * 0.3,
          }}
        />
      ))}

      <div className="max-w-7xl mx-auto text-center relative z-10">
        {/* Achievement badges floating */}
        <div className="flex flex-wrap justify-center gap-2 mb-6">
          <AchievementBadge icon={Trophy} label="Top Rated" color="bg-gradient-to-r from-amber-400 to-orange-400 text-white" delay={0.2} />
          <AchievementBadge icon={Flame} label="7 Day Streak" color="bg-gradient-to-r from-rose-500 to-pink-500 text-white" delay={0.4} />
          <AchievementBadge icon={Crown} label="Premium Quality" color="bg-gradient-to-r from-violet-500 to-purple-500 text-white" delay={0.6} />
        </div>

        {/* XP Notification */}
        <AnimatePresence>
          {xpGained && (
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20 }}
              className="fixed top-24 right-8 z-50"
            >
              <div className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-4 py-2 rounded-xl shadow-lg flex items-center gap-2">
                <Sparkles className="h-5 w-5 animate-pulse" />
                <span className="font-bold">+100 XP</span>
                <span className="text-emerald-100 text-sm">Welcome Bonus!</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Level indicator badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-white/90 border border-slate-200 shadow-lg mb-8"
        >
          {/* Level badge */}
          <div className="flex items-center gap-2">
            <div className="relative">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
                <Star className="h-4 w-4 text-white" />
              </div>
              <motion.div
                className="absolute -inset-1 rounded-full border-2 border-amber-400"
                animate={{ scale: [1, 1.2, 1], opacity: [1, 0, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            </div>
            <div className="text-left">
              <div className="text-xs text-slate-500">Level</div>
              <div className="text-sm font-bold text-slate-800">Pro Builder</div>
            </div>
          </div>
          
          <div className="w-px h-8 bg-slate-200" />
          
          {/* XP Progress */}
          <div className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-amber-500" />
            <div>
              <div className="text-xs text-slate-500">XP Progress</div>
              <div className="w-24 h-2 bg-slate-200 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-amber-400 to-orange-500 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: '75%' }}
                  transition={{ duration: 1.5, delay: 0.5 }}
                />
              </div>
            </div>
          </div>

          <div className="w-px h-8 bg-slate-200" />

          {/* Streak */}
          <div className="flex items-center gap-1.5">
            <Flame className="h-4 w-4 text-orange-500" />
            <span className="text-sm font-bold text-slate-800">{streakCount}</span>
            <span className="text-xs text-slate-500">day streak</span>
          </div>
        </motion.div>

        {/* Main heading */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-4xl sm:text-5xl lg:text-7xl font-bold text-slate-800 tracking-tight leading-tight"
        >
          Build Resumes That
          <br />
          <span className="relative">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-500 via-cyan-500 to-purple-500 animate-gradient">
              Get You Hired
            </span>
            <motion.svg
              className="absolute -bottom-2 left-0 w-full"
              viewBox="0 0 300 12"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{ duration: 1, delay: 0.5 }}
            >
              <motion.path
                d="M2 10C50 4 100 4 150 7C200 10 250 6 298 3"
                stroke="url(#gradient)"
                strokeWidth="3"
                fill="none"
                strokeLinecap="round"
              />
              <defs>
                <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#3b82f6" />
                  <stop offset="50%" stopColor="#8b5cf6" />
                  <stop offset="100%" stopColor="#06b6d4" />
                </linearGradient>
              </defs>
            </motion.svg>
          </span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-8 text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed"
        >
          Create AI-powered resumes tailored to specific job descriptions. 
          Stand out with professional templates and digital business cards.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-10 flex flex-col sm:flex-row gap-4 justify-center"
        >
          <Link href="/signup">
            <Button size="lg" className="text-lg px-8 h-14 bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 shadow-lg shadow-teal-500/30 border-0 transition-all duration-300 text-white">
              Start Building Free
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
          <Button 
            size="lg" 
            variant="outline" 
            className="text-lg px-8 h-14 border-slate-300 text-slate-700 hover:bg-slate-100 hover:border-slate-400 group"
            onClick={() => setShowDemo(true)}
          >
            <Play className="mr-2 h-5 w-5 group-hover:scale-110 transition-transform" />
            Watch Demo
          </Button>
        </motion.div>

        {/* Gamified Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto"
        >
          {[
            { value: 50000, label: 'Resumes Created', icon: Target, color: 'from-teal-500 to-cyan-500', suffix: '+' },
            { value: 95, label: 'ATS Pass Rate', icon: CheckCircle2, color: 'from-emerald-500 to-green-500', suffix: '%' },
            { value: 10000, label: 'Happy Users', icon: Trophy, color: 'from-amber-500 to-orange-500', suffix: '+' },
            { value: 4.9, label: 'User Rating', icon: Star, color: 'from-violet-500 to-purple-500', suffix: '★' },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.5, rotateY: -30 }}
              animate={{ opacity: 1, scale: 1, rotateY: 0 }}
              transition={{ duration: 0.5, delay: 0.5 + i * 0.1, type: 'spring' }}
              whileHover={{ scale: 1.05, y: -5 }}
              className="relative group cursor-pointer"
            >
              {/* Card glow effect */}
              <div className={`absolute inset-0 bg-gradient-to-r ${stat.color} rounded-2xl blur-xl opacity-0 group-hover:opacity-30 transition-opacity duration-300`} />
              
              {/* Card content */}
              <div className="relative bg-white/80 backdrop-blur-sm border border-slate-200 rounded-2xl p-4 shadow-lg group-hover:shadow-xl transition-all duration-300">
                {/* Icon */}
                <div className={`w-10 h-10 mx-auto mb-3 rounded-xl bg-gradient-to-r ${stat.color} flex items-center justify-center`}>
                  <stat.icon className="h-5 w-5 text-white" />
                </div>
                
                {/* Value with animated counter */}
                <div className="text-2xl sm:text-3xl font-bold text-slate-800">
                  {stat.value >= 1000 ? (
                    <AnimatedCounter end={stat.value} suffix={stat.suffix} />
                  ) : (
                    <>{stat.value}{stat.suffix}</>
                  )}
                </div>
                
                {/* Label */}
                <div className="text-xs text-slate-500 mt-1">{stat.label}</div>
                
                {/* Achievement unlock indicator */}
                <motion.div
                  className="absolute -top-2 -right-2"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 1 + i * 0.2, type: 'spring' }}
                >
                  <div className={`w-6 h-6 rounded-full bg-gradient-to-r ${stat.color} flex items-center justify-center shadow-lg`}>
                    <CheckCircle2 className="h-3.5 w-3.5 text-white" />
                  </div>
                </motion.div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Quest/Mission teaser */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.8 }}
          className="mt-12 inline-flex items-center gap-3 px-6 py-3 rounded-2xl bg-gradient-to-r from-violet-500/10 to-purple-500/10 border border-violet-200"
        >
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-violet-500 to-purple-500 flex items-center justify-center">
              <Target className="h-4 w-4 text-white" />
            </div>
            <div className="text-left">
              <div className="text-xs text-violet-600 font-medium">Daily Quest</div>
              <div className="text-sm text-slate-700">Create your first resume and earn <span className="font-bold text-violet-600">500 XP</span></div>
            </div>
          </div>
          <motion.div
            animate={{ x: [0, 5, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            <ArrowRight className="h-5 w-5 text-violet-500" />
          </motion.div>
        </motion.div>
      </div>

      {/* Demo Modal */}
      <DemoModal isOpen={showDemo} onClose={() => setShowDemo(false)} />
    </section>
  )
}
