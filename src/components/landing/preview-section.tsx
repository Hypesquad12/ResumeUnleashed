'use client'

import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion'
import { useRef, useState, useEffect } from 'react'
import { CheckCircle, Sparkles, FileText, Zap, Mail, Phone, MapPin, Briefcase, GraduationCap, Award, TrendingUp, ArrowRight, X, Check } from 'lucide-react'

export function PreviewSection() {
  const containerRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  })
  
  const y = useTransform(scrollYProgress, [0, 1], [50, -50])
  const rotate = useTransform(scrollYProgress, [0, 1], [2, -2])
  
  const [activeSection, setActiveSection] = useState(0)
  const [atsScore, setAtsScore] = useState(78)
  const [showAfter, setShowAfter] = useState(false)
  const [activeComparison, setActiveComparison] = useState(0)
  const [showAfterResume, setShowAfterResume] = useState(false)

  const beforeAfterExamples = [
    {
      label: 'Summary',
      before: 'Hardworking professional looking for new opportunities in the tech industry.',
      after: 'Results-driven Software Engineer with 5+ years of experience building scalable web applications. Increased system performance by 40% and led a team of 4 developers.',
      improvements: ['Added metrics', 'Specific role', 'Quantified achievements']
    },
    {
      label: 'Experience',
      before: 'Responsible for managing projects and working with clients on various tasks.',
      after: 'Led cross-functional team of 8 to deliver $2M enterprise project 2 weeks ahead of schedule. Reduced client onboarding time by 60% through process automation.',
      improvements: ['Action verbs', 'Specific numbers', 'Clear impact']
    },
    {
      label: 'Skills',
      before: 'Good at computers, Microsoft Office, team player, hard worker',
      after: 'React, TypeScript, Node.js, AWS, PostgreSQL, Docker, Agile/Scrum, CI/CD pipelines',
      improvements: ['Industry keywords', 'ATS-friendly', 'Specific technologies']
    }
  ]
  
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSection((prev) => (prev + 1) % 4)
    }, 3000)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    // Animate ATS score up when section changes
    const targetScore = 95
    const duration = 1500
    const startScore = 78
    const startTime = Date.now()
    
    const animate = () => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / duration, 1)
      const easeOut = 1 - Math.pow(1 - progress, 3)
      setAtsScore(Math.round(startScore + (targetScore - startScore) * easeOut))
      
      if (progress < 1) {
        requestAnimationFrame(animate)
      }
    }
    
    animate()
  }, [])

  const sections = [
    { label: 'Contact', color: 'from-teal-500 to-emerald-400', icon: Mail },
    { label: 'Experience', color: 'from-violet-500 to-purple-400', icon: Briefcase },
    { label: 'Skills', color: 'from-cyan-500 to-blue-400', icon: Award },
    { label: 'Education', color: 'from-rose-500 to-pink-400', icon: GraduationCap },
  ]

  const benefits = [
    { icon: CheckCircle, text: 'ATS-optimized formatting', color: 'text-teal-500' },
    { icon: Sparkles, text: 'AI-powered content suggestions', color: 'text-violet-500' },
    { icon: FileText, text: 'Multiple export formats', color: 'text-cyan-500' },
    { icon: Zap, text: 'Real-time preview', color: 'text-amber-500' },
  ]

  const skills = [
    { name: 'React', level: 95 },
    { name: 'TypeScript', level: 90 },
    { name: 'Node.js', level: 85 },
    { name: 'Python', level: 80 },
  ]

  return (
    <section ref={containerRef} className="py-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-0 w-96 h-96 bg-teal-200/30 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-0 w-96 h-96 bg-violet-200/30 rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto relative">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <motion.span 
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-teal-500/10 to-violet-500/10 border border-teal-200"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <Sparkles className="h-4 w-4 text-teal-500" />
              <span className="text-sm font-medium text-slate-700">How It Works</span>
            </motion.span>
            
            <h2 className="mt-6 text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-800 leading-tight">
              Create Your Perfect Resume in
              <span className="relative">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-500 via-violet-500 to-purple-500"> Minutes</span>
                <motion.svg
                  className="absolute -bottom-2 left-0 w-full"
                  viewBox="0 0 200 12"
                  initial={{ pathLength: 0 }}
                  whileInView={{ pathLength: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 1, delay: 0.5 }}
                >
                  <motion.path
                    d="M2 8 Q50 2, 100 8 T198 8"
                    fill="none"
                    stroke="url(#gradient)"
                    strokeWidth="3"
                    strokeLinecap="round"
                  />
                  <defs>
                    <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#14b8a6" />
                      <stop offset="50%" stopColor="#8b5cf6" />
                      <stop offset="100%" stopColor="#a855f7" />
                    </linearGradient>
                  </defs>
                </motion.svg>
              </span>
            </h2>
            <p className="mt-8 text-lg text-slate-600 leading-relaxed">
              Our AI-powered platform analyzes job descriptions and optimizes your resume 
              to pass ATS systems and impress hiring managers. Get more interviews with less effort.
            </p>

            {/* Benefits list */}
            <div className="mt-10 grid grid-cols-2 gap-4">
              {benefits.map((benefit, index) => (
                <motion.div
                  key={benefit.text}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  className="flex items-start gap-3 p-3 rounded-xl bg-white/60 backdrop-blur-sm border border-slate-100 hover:border-slate-200 hover:shadow-lg transition-all group"
                >
                  <div className={`p-2 rounded-lg bg-gradient-to-br from-slate-50 to-slate-100 group-hover:scale-110 transition-transform`}>
                    <benefit.icon className={`h-5 w-5 ${benefit.color}`} />
                  </div>
                  <span className="text-sm text-slate-600 group-hover:text-slate-800 transition-colors leading-tight">{benefit.text}</span>
                </motion.div>
              ))}
            </div>

            {/* Section tabs */}
            <div className="mt-10 flex flex-wrap gap-2">
              {sections.map((section, index) => (
                <motion.button
                  key={section.label}
                  onClick={() => setActiveSection(index)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    activeSection === index
                      ? `bg-gradient-to-r ${section.color} text-white shadow-lg shadow-${section.color.split('-')[1]}-500/25`
                      : 'bg-white/80 text-slate-600 hover:bg-white hover:shadow-md border border-slate-100'
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <section.icon className="h-4 w-4" />
                  {section.label}
                </motion.button>
              ))}
            </div>
          </motion.div>

          {/* Right - Interactive Resume Preview */}
          <motion.div
            style={{ y }}
            className="relative lg:ml-8"
          >
            {/* Decorative grid */}
            <div className="absolute inset-0 -m-8">
              <div className="absolute inset-0 bg-[linear-gradient(to_right,#14b8a622_1px,transparent_1px),linear-gradient(to_bottom,#8b5cf622_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)]" />
            </div>

            {/* Before/After Toggle */}
            <motion.div 
              className="absolute -top-16 left-1/2 -translate-x-1/2 z-30"
              initial={{ opacity: 0, y: -20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <div className="flex items-center gap-1 p-1 rounded-full bg-white shadow-lg border border-slate-200">
                <button
                  onClick={() => setShowAfterResume(false)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    !showAfterResume 
                      ? 'bg-gradient-to-r from-slate-600 to-slate-700 text-white shadow-md' 
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  Before
                </button>
                <button
                  onClick={() => setShowAfterResume(true)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    showAfterResume 
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-md' 
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  After AI ✨
                </button>
              </div>
            </motion.div>

            {/* Main resume card */}
            <motion.div
              initial={{ opacity: 0, y: 50, rotateY: -10 }}
              whileInView={{ opacity: 1, y: 0, rotateY: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, type: "spring" }}
              style={{ rotateZ: rotate }}
              className="relative z-10"
            >
              {/* Outer glow - changes color based on state */}
              <div className={`absolute -inset-1 rounded-3xl blur-xl opacity-30 transition-all duration-500 ${
                showAfterResume 
                  ? 'bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500' 
                  : 'bg-gradient-to-r from-slate-400 via-slate-500 to-slate-400'
              }`} />
              
              {/* Resume container */}
              <div className={`relative aspect-[3/4] rounded-2xl border shadow-2xl overflow-hidden transition-all duration-500 ${
                showAfterResume 
                  ? 'bg-gradient-to-br from-white via-emerald-50/30 to-teal-50/50 border-emerald-200/80 shadow-emerald-200/50' 
                  : 'bg-gradient-to-br from-slate-100 via-slate-50 to-white border-slate-300/80 shadow-slate-300/50'
              }`}>
                {/* Top accent bar */}
                <div className={`absolute top-0 left-0 right-0 h-1.5 transition-all duration-500 ${
                  showAfterResume 
                    ? 'bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500' 
                    : 'bg-gradient-to-r from-slate-400 via-slate-500 to-slate-400'
                }`} />
                
                {/* Resume content */}
                <div className="p-6 h-full flex flex-col">
                  {/* Header section */}
                  <motion.div 
                    className={`mb-4 p-4 rounded-xl transition-all duration-500 ${
                      showAfterResume
                        ? (activeSection === 0 
                          ? 'bg-gradient-to-r from-teal-500 to-emerald-400 shadow-lg shadow-teal-500/20' 
                          : 'bg-gradient-to-r from-teal-50 to-emerald-50 border border-teal-100')
                        : 'bg-slate-100 border border-slate-200'
                    }`}
                    animate={{ scale: activeSection === 0 && showAfterResume ? 1.02 : 1 }}
                  >
                    <div className="flex items-start gap-4">
                      {/* Avatar */}
                      <div className={`w-14 h-14 rounded-xl flex items-center justify-center text-lg font-bold transition-all duration-500 ${
                        showAfterResume
                          ? (activeSection === 0 ? 'bg-white/20 text-white' : 'bg-gradient-to-br from-teal-400 to-emerald-400 text-white')
                          : 'bg-slate-200 text-slate-500'
                      }`}>
                        JD
                      </div>
                      <div className="flex-1">
                        <div className={`h-4 w-32 rounded-md mb-2 transition-all duration-500 ${
                          showAfterResume
                            ? (activeSection === 0 ? 'bg-white/60' : 'bg-teal-200')
                            : 'bg-slate-300'
                        }`} />
                        <div className={`h-3 w-24 rounded-md transition-all duration-500 ${
                          showAfterResume
                            ? (activeSection === 0 ? 'bg-white/40' : 'bg-teal-100')
                            : 'bg-slate-200'
                        }`} />
                        <div className="flex gap-3 mt-3">
                          {[Mail, Phone, MapPin].map((Icon, i) => (
                            <div key={i} className={`flex items-center gap-1 transition-all duration-500 ${
                              showAfterResume
                                ? (activeSection === 0 ? 'text-white/70' : 'text-teal-500')
                                : 'text-slate-400'
                            }`}>
                              <Icon className="h-3 w-3" />
                              <div className={`h-2 w-12 rounded transition-all duration-500 ${
                                showAfterResume
                                  ? (activeSection === 0 ? 'bg-white/30' : 'bg-teal-100')
                                  : 'bg-slate-200'
                              }`} />
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </motion.div>

                  {/* Experience section */}
                  <motion.div 
                    className={`mb-4 p-4 rounded-xl transition-all duration-500 ${
                      showAfterResume
                        ? (activeSection === 1 
                          ? 'bg-gradient-to-r from-violet-500 to-purple-400 shadow-lg shadow-violet-500/20' 
                          : 'bg-gradient-to-r from-violet-50 to-purple-50 border border-violet-100')
                        : 'bg-slate-100 border border-slate-200'
                    }`}
                    animate={{ scale: activeSection === 1 && showAfterResume ? 1.02 : 1 }}
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <Briefcase className={`h-4 w-4 transition-all duration-500 ${
                        showAfterResume
                          ? (activeSection === 1 ? 'text-white' : 'text-violet-500')
                          : 'text-slate-400'
                      }`} />
                      <div className={`h-3 w-20 rounded transition-all duration-500 ${
                        showAfterResume
                          ? (activeSection === 1 ? 'bg-white/60' : 'bg-violet-200')
                          : 'bg-slate-300'
                      }`} />
                    </div>
                    <div className="space-y-2">
                      {[1, 0.85, 0.7].map((width, i) => (
                        <motion.div 
                          key={i}
                          className={`h-2 rounded transition-all duration-500 ${
                            showAfterResume
                              ? (activeSection === 1 ? 'bg-white/30' : 'bg-violet-100')
                              : 'bg-slate-200'
                          }`}
                          style={{ width: showAfterResume ? `${width * 100}%` : `${width * 70}%` }}
                          initial={{ scaleX: 0 }}
                          animate={{ scaleX: 1 }}
                          transition={{ delay: i * 0.1 }}
                        />
                      ))}
                    </div>
                  </motion.div>

                  {/* Skills section */}
                  <motion.div 
                    className={`mb-4 p-4 rounded-xl transition-all duration-500 flex-1 ${
                      showAfterResume
                        ? (activeSection === 2 
                          ? 'bg-gradient-to-r from-cyan-500 to-blue-400 shadow-lg shadow-cyan-500/20' 
                          : 'bg-gradient-to-r from-cyan-50 to-blue-50 border border-cyan-100')
                        : 'bg-slate-100 border border-slate-200'
                    }`}
                    animate={{ scale: activeSection === 2 && showAfterResume ? 1.02 : 1 }}
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <Award className={`h-4 w-4 transition-all duration-500 ${
                        showAfterResume
                          ? (activeSection === 2 ? 'text-white' : 'text-cyan-500')
                          : 'text-slate-400'
                      }`} />
                      <div className={`h-3 w-16 rounded transition-all duration-500 ${
                        showAfterResume
                          ? (activeSection === 2 ? 'bg-white/60' : 'bg-cyan-200')
                          : 'bg-slate-300'
                      }`} />
                    </div>
                    <div className="space-y-2">
                      {skills.map((skill, i) => (
                        <div key={skill.name} className="flex items-center gap-2">
                          <span className={`text-xs font-medium w-16 transition-all duration-500 ${
                            showAfterResume
                              ? (activeSection === 2 ? 'text-white/80' : 'text-cyan-600')
                              : 'text-slate-400'
                          }`}>
                            {showAfterResume ? skill.name : '•••••'}
                          </span>
                          <div className={`flex-1 h-2 rounded-full overflow-hidden transition-all duration-500 ${
                            showAfterResume
                              ? (activeSection === 2 ? 'bg-white/20' : 'bg-cyan-100')
                              : 'bg-slate-200'
                          }`}>
                            <motion.div
                              className={`h-full rounded-full transition-all duration-500 ${
                                showAfterResume
                                  ? (activeSection === 2 ? 'bg-white/60' : 'bg-gradient-to-r from-cyan-400 to-blue-400')
                                  : 'bg-slate-300'
                              }`}
                              initial={{ width: 0 }}
                              animate={{ width: showAfterResume ? `${skill.level}%` : '40%' }}
                              transition={{ duration: 0.8, delay: i * 0.1 }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>

                  {/* Education section */}
                  <motion.div 
                    className={`p-4 rounded-xl transition-all duration-500 ${
                      showAfterResume
                        ? (activeSection === 3 
                          ? 'bg-gradient-to-r from-rose-500 to-pink-400 shadow-lg shadow-rose-500/20' 
                          : 'bg-gradient-to-r from-rose-50 to-pink-50 border border-rose-100')
                        : 'bg-slate-100 border border-slate-200'
                    }`}
                    animate={{ scale: activeSection === 3 && showAfterResume ? 1.02 : 1 }}
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <GraduationCap className={`h-4 w-4 transition-all duration-500 ${
                        showAfterResume
                          ? (activeSection === 3 ? 'text-white' : 'text-rose-500')
                          : 'text-slate-400'
                      }`} />
                      <div className={`h-3 w-20 rounded transition-all duration-500 ${
                        showAfterResume
                          ? (activeSection === 3 ? 'bg-white/60' : 'bg-rose-200')
                          : 'bg-slate-300'
                      }`} />
                    </div>
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-500 ${
                        showAfterResume
                          ? (activeSection === 3 ? 'bg-white/20' : 'bg-rose-100')
                          : 'bg-slate-200'
                      }`}>
                        <GraduationCap className={`h-5 w-5 transition-all duration-500 ${
                          showAfterResume
                            ? (activeSection === 3 ? 'text-white' : 'text-rose-400')
                            : 'text-slate-400'
                        }`} />
                      </div>
                      <div className="flex-1 space-y-1.5">
                        <div className={`h-2.5 rounded transition-all duration-500 ${
                          showAfterResume
                            ? (activeSection === 3 ? 'bg-white/50 w-28' : 'bg-rose-200 w-32')
                            : 'bg-slate-200 w-20'
                        }`} />
                        <div className={`h-2 rounded transition-all duration-500 ${
                          showAfterResume
                            ? (activeSection === 3 ? 'bg-white/30 w-20' : 'bg-rose-100 w-24')
                            : 'bg-slate-200 w-16'
                        }`} />
                      </div>
                    </div>
                  </motion.div>
                </div>
              </div>
            </motion.div>

            {/* Floating ATS Score badge - only show when After is selected */}
            <AnimatePresence>
              {showAfterResume && (
                <motion.div
                  className="absolute -right-2 sm:right-0 top-8 z-20"
                  initial={{ opacity: 0, x: 50, scale: 0.8 }}
                  animate={{ opacity: 1, x: 0, scale: 1, y: [0, -8, 0] }}
                  exit={{ opacity: 0, x: 50, scale: 0.8 }}
                  transition={{ 
                    y: { duration: 3, repeat: Infinity, ease: "easeInOut" },
                    opacity: { duration: 0.3 },
                    x: { duration: 0.3 },
                    scale: { duration: 0.3 }
                  }}
                >
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-teal-500 to-emerald-400 rounded-2xl blur-lg opacity-40" />
                    <div className="relative bg-gradient-to-r from-teal-500 to-emerald-400 text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-3">
                      <div className="relative w-12 h-12">
                        <svg className="w-12 h-12 -rotate-90">
                          <circle cx="24" cy="24" r="20" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="4" />
                          <motion.circle
                            cx="24" cy="24" r="20"
                            fill="none"
                            stroke="white"
                            strokeWidth="4"
                            strokeLinecap="round"
                            strokeDasharray={125.6}
                            initial={{ strokeDashoffset: 125.6 }}
                            animate={{ strokeDashoffset: 125.6 - (125.6 * atsScore / 100) }}
                            transition={{ duration: 1.5, ease: "easeOut" }}
                          />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <TrendingUp className="h-4 w-4 text-white" />
                        </div>
                      </div>
                      <div>
                        <div className="text-xs font-medium text-white/80">ATS Score</div>
                        <div className="text-2xl font-bold">{atsScore}%</div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Low ATS Score badge - only show when Before is selected */}
            <AnimatePresence>
              {!showAfterResume && (
                <motion.div
                  className="absolute -right-2 sm:right-0 top-8 z-20"
                  initial={{ opacity: 0, x: 50, scale: 0.8 }}
                  animate={{ opacity: 1, x: 0, scale: 1, y: [0, -8, 0] }}
                  exit={{ opacity: 0, x: 50, scale: 0.8 }}
                  transition={{ 
                    y: { duration: 3, repeat: Infinity, ease: "easeInOut" },
                    opacity: { duration: 0.3 },
                    x: { duration: 0.3 },
                    scale: { duration: 0.3 }
                  }}
                >
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-slate-500 to-slate-600 rounded-2xl blur-lg opacity-40" />
                    <div className="relative bg-gradient-to-r from-slate-500 to-slate-600 text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-3">
                      <div className="relative w-12 h-12">
                        <svg className="w-12 h-12 -rotate-90">
                          <circle cx="24" cy="24" r="20" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="4" />
                          <circle
                            cx="24" cy="24" r="20"
                            fill="none"
                            stroke="rgba(255,255,255,0.5)"
                            strokeWidth="4"
                            strokeLinecap="round"
                            strokeDasharray={125.6}
                            strokeDashoffset={125.6 - (125.6 * 45 / 100)}
                          />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <X className="h-4 w-4 text-white/70" />
                        </div>
                      </div>
                      <div>
                        <div className="text-xs font-medium text-white/80">ATS Score</div>
                        <div className="text-2xl font-bold">45%</div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* AI Optimized badge - only show when After is selected */}
            <AnimatePresence>
              {showAfterResume && (
                <motion.div
                  className="absolute -left-2 sm:left-0 top-1/3 z-20"
                  initial={{ opacity: 0, x: -50, scale: 0.8 }}
                  animate={{ opacity: 1, x: 0, scale: 1, y: [0, 10, 0] }}
                  exit={{ opacity: 0, x: -50, scale: 0.8 }}
                  transition={{ 
                    y: { duration: 3.5, repeat: Infinity, ease: "easeInOut" },
                    opacity: { duration: 0.3 },
                    x: { duration: 0.3 },
                    scale: { duration: 0.3 }
                  }}
                >
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-violet-500 to-purple-400 rounded-2xl blur-lg opacity-40" />
                    <div className="relative bg-gradient-to-r from-violet-500 to-purple-400 text-white px-5 py-3 rounded-2xl shadow-xl">
                      <div className="flex items-center gap-2">
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                        >
                          <Sparkles className="h-5 w-5" />
                        </motion.div>
                        <span className="font-semibold">AI Optimized</span>
                      </div>
                      <div className="text-xs text-white/70 mt-1">Keywords matched</div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Needs Work badge - only show when Before is selected */}
            <AnimatePresence>
              {!showAfterResume && (
                <motion.div
                  className="absolute -left-2 sm:left-0 top-1/3 z-20"
                  initial={{ opacity: 0, x: -50, scale: 0.8 }}
                  animate={{ opacity: 1, x: 0, scale: 1, y: [0, 10, 0] }}
                  exit={{ opacity: 0, x: -50, scale: 0.8 }}
                  transition={{ 
                    y: { duration: 3.5, repeat: Infinity, ease: "easeInOut" },
                    opacity: { duration: 0.3 },
                    x: { duration: 0.3 },
                    scale: { duration: 0.3 }
                  }}
                >
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-amber-500 to-orange-400 rounded-2xl blur-lg opacity-40" />
                    <div className="relative bg-gradient-to-r from-amber-500 to-orange-400 text-white px-5 py-3 rounded-2xl shadow-xl">
                      <div className="flex items-center gap-2">
                        <X className="h-5 w-5" />
                        <span className="font-semibold">Needs Work</span>
                      </div>
                      <div className="text-xs text-white/70 mt-1">Missing keywords</div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Ready to Export badge - only show when After is selected */}
            <AnimatePresence>
              {showAfterResume && (
                <motion.div
                  className="absolute right-4 -bottom-2 z-20"
                  initial={{ opacity: 0, y: 50, scale: 0.8 }}
                  animate={{ opacity: 1, y: [0, -6, 0], scale: 1 }}
                  exit={{ opacity: 0, y: 50, scale: 0.8 }}
                  transition={{ 
                    y: { duration: 2.5, repeat: Infinity, ease: "easeInOut" },
                    opacity: { duration: 0.3 },
                    scale: { duration: 0.3 }
                  }}
                >
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-blue-400 rounded-2xl blur-lg opacity-40" />
                    <div className="relative bg-gradient-to-r from-cyan-500 to-blue-400 text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-2">
                      <motion.div
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                      >
                        <Zap className="h-5 w-5" />
                      </motion.div>
                      <div>
                        <div className="font-semibold">Ready to Export</div>
                        <div className="text-xs text-white/70">PDF, DOCX, TXT</div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Not Ready badge - only show when Before is selected */}
            <AnimatePresence>
              {!showAfterResume && (
                <motion.div
                  className="absolute right-4 -bottom-2 z-20"
                  initial={{ opacity: 0, y: 50, scale: 0.8 }}
                  animate={{ opacity: 1, y: [0, -6, 0], scale: 1 }}
                  exit={{ opacity: 0, y: 50, scale: 0.8 }}
                  transition={{ 
                    y: { duration: 2.5, repeat: Infinity, ease: "easeInOut" },
                    opacity: { duration: 0.3 },
                    scale: { duration: 0.3 }
                  }}
                >
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-rose-500 to-red-400 rounded-2xl blur-lg opacity-40" />
                    <div className="relative bg-gradient-to-r from-rose-500 to-red-400 text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-2">
                      <X className="h-5 w-5" />
                      <div>
                        <div className="font-semibold">Not Ready</div>
                        <div className="text-xs text-white/70">Needs optimization</div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Decorative elements - colorful based on state */}
            <motion.div 
              className={`absolute -top-8 -right-8 w-24 h-24 border-2 border-dashed rounded-full transition-colors duration-500 ${
                showAfterResume ? 'border-teal-300' : 'border-slate-300'
              }`}
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            />
            <motion.div 
              className={`absolute -bottom-8 -left-8 w-16 h-16 border-2 border-dashed rounded-full transition-colors duration-500 ${
                showAfterResume ? 'border-violet-300' : 'border-slate-300'
              }`}
              animate={{ rotate: -360 }}
              transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
            />
          </motion.div>
        </div>

        {/* Before/After Comparison Section */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mt-32"
        >
          {/* Section header */}
          <div className="text-center mb-12">
            <motion.span 
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-rose-500/10 to-orange-500/10 border border-rose-200"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <Sparkles className="h-4 w-4 text-rose-500" />
              <span className="text-sm font-medium text-slate-700">AI Transformation</span>
            </motion.span>
            <h3 className="mt-4 text-3xl sm:text-4xl font-bold text-slate-800">
              See the <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-500 to-orange-500">Difference</span>
            </h3>
            <p className="mt-3 text-slate-600 max-w-2xl mx-auto">
              Watch how our AI transforms generic resume content into powerful, ATS-optimized statements
            </p>
          </div>

          {/* Comparison tabs */}
          <div className="flex justify-center gap-2 mb-8">
            {beforeAfterExamples.map((example, index) => (
              <motion.button
                key={example.label}
                onClick={() => {
                  setActiveComparison(index)
                  setShowAfter(false)
                }}
                className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  activeComparison === index
                    ? 'bg-gradient-to-r from-rose-500 to-orange-500 text-white shadow-lg shadow-rose-500/25'
                    : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {example.label}
              </motion.button>
            ))}
          </div>

          {/* Before/After cards */}
          <div className="max-w-5xl mx-auto">
            <div className="grid md:grid-cols-2 gap-6 relative">
              {/* Before card */}
              <motion.div
                className={`relative p-6 rounded-2xl border-2 transition-all duration-500 ${
                  showAfter ? 'border-slate-200 bg-slate-50/50' : 'border-rose-300 bg-white shadow-xl shadow-rose-100'
                }`}
                animate={{ scale: showAfter ? 0.98 : 1 }}
              >
                <div className="flex items-center gap-2 mb-4">
                  <div className={`p-1.5 rounded-lg ${showAfter ? 'bg-slate-200' : 'bg-rose-100'}`}>
                    <X className={`h-4 w-4 ${showAfter ? 'text-slate-500' : 'text-rose-500'}`} />
                  </div>
                  <span className={`text-sm font-semibold ${showAfter ? 'text-slate-400' : 'text-rose-600'}`}>Before</span>
                  {!showAfter && (
                    <span className="ml-auto text-xs px-2 py-1 rounded-full bg-rose-100 text-rose-600 font-medium">
                      Generic
                    </span>
                  )}
                </div>
                <p className={`text-base leading-relaxed transition-colors ${showAfter ? 'text-slate-400' : 'text-slate-700'}`}>
                  &ldquo;{beforeAfterExamples[activeComparison].before}&rdquo;
                </p>
                {!showAfter && (
                  <motion.div 
                    className="mt-4 flex flex-wrap gap-2"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    <span className="text-xs px-2 py-1 rounded-full bg-slate-100 text-slate-500">No metrics</span>
                    <span className="text-xs px-2 py-1 rounded-full bg-slate-100 text-slate-500">Vague</span>
                    <span className="text-xs px-2 py-1 rounded-full bg-slate-100 text-slate-500">Generic</span>
                  </motion.div>
                )}
              </motion.div>

              {/* Arrow / Transform button */}
              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 hidden md:block">
                <motion.button
                  onClick={() => setShowAfter(!showAfter)}
                  className={`p-4 rounded-full shadow-xl transition-all ${
                    showAfter 
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-500 shadow-emerald-200' 
                      : 'bg-gradient-to-r from-rose-500 to-orange-500 shadow-rose-200'
                  }`}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  animate={{ rotate: showAfter ? 180 : 0 }}
                >
                  <ArrowRight className="h-6 w-6 text-white" />
                </motion.button>
              </div>

              {/* After card */}
              <motion.div
                className={`relative p-6 rounded-2xl border-2 transition-all duration-500 ${
                  showAfter ? 'border-emerald-300 bg-white shadow-xl shadow-emerald-100' : 'border-slate-200 bg-slate-50/50'
                }`}
                animate={{ scale: showAfter ? 1 : 0.98 }}
              >
                <div className="flex items-center gap-2 mb-4">
                  <div className={`p-1.5 rounded-lg ${showAfter ? 'bg-emerald-100' : 'bg-slate-200'}`}>
                    <Check className={`h-4 w-4 ${showAfter ? 'text-emerald-500' : 'text-slate-500'}`} />
                  </div>
                  <span className={`text-sm font-semibold ${showAfter ? 'text-emerald-600' : 'text-slate-400'}`}>After</span>
                  {showAfter && (
                    <span className="ml-auto text-xs px-2 py-1 rounded-full bg-emerald-100 text-emerald-600 font-medium">
                      AI Optimized
                    </span>
                  )}
                </div>
                <p className={`text-base leading-relaxed transition-colors ${showAfter ? 'text-slate-700' : 'text-slate-400'}`}>
                  &ldquo;{beforeAfterExamples[activeComparison].after}&rdquo;
                </p>
                {showAfter && (
                  <motion.div 
                    className="mt-4 flex flex-wrap gap-2"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    {beforeAfterExamples[activeComparison].improvements.map((improvement) => (
                      <span key={improvement} className="text-xs px-2 py-1 rounded-full bg-emerald-100 text-emerald-600 font-medium flex items-center gap-1">
                        <Check className="h-3 w-3" />
                        {improvement}
                      </span>
                    ))}
                  </motion.div>
                )}
              </motion.div>
            </div>

            {/* Mobile transform button */}
            <div className="flex justify-center mt-6 md:hidden">
              <motion.button
                onClick={() => setShowAfter(!showAfter)}
                className={`px-6 py-3 rounded-xl font-medium flex items-center gap-2 ${
                  showAfter 
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-200' 
                    : 'bg-gradient-to-r from-rose-500 to-orange-500 text-white shadow-lg shadow-rose-200'
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {showAfter ? 'Show Before' : 'Transform with AI'}
                <ArrowRight className={`h-4 w-4 transition-transform ${showAfter ? 'rotate-180' : ''}`} />
              </motion.button>
            </div>

            {/* Stats bar */}
            <motion.div 
              className="mt-10 p-6 rounded-2xl bg-gradient-to-r from-slate-900 to-slate-800 text-white"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <div className="grid grid-cols-3 gap-6 text-center">
                <div>
                  <div className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-emerald-400">3x</div>
                  <div className="text-sm text-slate-400 mt-1">More Interviews</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-purple-400">95%</div>
                  <div className="text-sm text-slate-400 mt-1">ATS Pass Rate</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-rose-400 to-orange-400">2 min</div>
                  <div className="text-sm text-slate-400 mt-1">Avg. Optimization</div>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
