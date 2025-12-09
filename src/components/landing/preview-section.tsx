'use client'

import { motion, useScroll, useTransform } from 'framer-motion'
import { useRef, useState, useEffect } from 'react'
import { CheckCircle, Sparkles, FileText, Zap } from 'lucide-react'

export function PreviewSection() {
  const containerRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  })
  
  const y = useTransform(scrollYProgress, [0, 1], [100, -100])
  const opacity = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [0, 1, 1, 0])
  
  const [activeSection, setActiveSection] = useState(0)
  
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSection((prev) => (prev + 1) % 4)
    }, 2500)
    return () => clearInterval(timer)
  }, [])

  const sections = [
    { label: 'Contact Info', color: 'from-teal-500 to-teal-400' },
    { label: 'Experience', color: 'from-purple-500 to-purple-400' },
    { label: 'Skills', color: 'from-cyan-500 to-cyan-400' },
    { label: 'Education', color: 'from-rose-400 to-pink-400' },
  ]

  const benefits = [
    { icon: CheckCircle, text: 'ATS-optimized formatting' },
    { icon: Sparkles, text: 'AI-powered content suggestions' },
    { icon: FileText, text: 'Multiple export formats' },
    { icon: Zap, text: 'Real-time preview' },
  ]

  return (
    <section ref={containerRef} className="py-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <span className="text-primary font-semibold text-sm uppercase tracking-wider">How It Works</span>
            <h2 className="mt-4 text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-tight">
              Create Your Perfect Resume in
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-purple-400"> Minutes</span>
            </h2>
            <p className="mt-6 text-lg text-slate-400 leading-relaxed">
              Our AI-powered platform analyzes job descriptions and optimizes your resume 
              to pass ATS systems and impress hiring managers. Get more interviews with less effort.
            </p>

            {/* Benefits list */}
            <div className="mt-8 space-y-4">
              {benefits.map((benefit, index) => (
                <motion.div
                  key={benefit.text}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  className="flex items-center gap-3 group"
                >
                  <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                    <benefit.icon className="h-5 w-5 text-primary" />
                  </div>
                  <span className="text-slate-300 group-hover:text-white transition-colors">{benefit.text}</span>
                </motion.div>
              ))}
            </div>

            {/* Progress indicators */}
            <div className="mt-10 flex gap-2">
              {sections.map((section, index) => (
                <motion.button
                  key={section.label}
                  onClick={() => setActiveSection(index)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    activeSection === index
                      ? 'bg-gradient-to-r text-white ' + section.color
                      : 'bg-white/5 text-slate-400 hover:bg-white/10'
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {section.label}
                </motion.button>
              ))}
            </div>
          </motion.div>

          {/* Right - Interactive Resume Preview */}
          <motion.div
            style={{ y, opacity }}
            className="relative"
          >
            {/* Main resume card */}
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="relative z-10"
            >
              <div className="aspect-[3/4] rounded-2xl bg-gradient-to-br from-slate-800/80 to-slate-900/80 border border-white/10 p-6 shadow-2xl backdrop-blur-xl">
                <div className="h-full bg-white rounded-xl p-5 space-y-4 overflow-hidden">
                  {sections.map((section, i) => (
                    <motion.div
                      key={section.label}
                      className={`rounded-lg p-3 transition-all duration-500 ${
                        activeSection === i
                          ? `bg-gradient-to-r ${section.color} shadow-lg`
                          : 'bg-slate-50'
                      }`}
                      animate={{
                        scale: activeSection === i ? 1.02 : 1,
                        y: activeSection === i ? -2 : 0,
                      }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className={`h-2.5 w-24 rounded ${activeSection === i ? 'bg-white/60' : 'bg-slate-200'}`} />
                      <div className={`h-2 w-36 rounded mt-2 ${activeSection === i ? 'bg-white/40' : 'bg-slate-100'}`} />
                      {i === 1 && (
                        <div className="mt-3 space-y-1.5">
                          <div className={`h-1.5 w-full rounded ${activeSection === i ? 'bg-white/30' : 'bg-slate-100'}`} />
                          <div className={`h-1.5 w-4/5 rounded ${activeSection === i ? 'bg-white/30' : 'bg-slate-100'}`} />
                          <div className={`h-1.5 w-3/4 rounded ${activeSection === i ? 'bg-white/30' : 'bg-slate-100'}`} />
                        </div>
                      )}
                      {i === 2 && (
                        <div className="mt-3 flex flex-wrap gap-1.5">
                          {['React', 'Node', 'Python', 'AWS'].map((skill) => (
                            <span
                              key={skill}
                              className={`px-2 py-0.5 rounded text-xs ${
                                activeSection === i ? 'bg-white/30 text-white' : 'bg-slate-100 text-slate-400'
                              }`}
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Floating badges */}
            <motion.div
              className="absolute -right-4 top-1/4 z-20"
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            >
              <div className="bg-gradient-to-r from-teal-500 to-teal-400 text-white px-4 py-2 rounded-full text-sm font-semibold shadow-lg shadow-teal-500/20 flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                ATS Score: 95%
              </div>
            </motion.div>

            <motion.div
              className="absolute -left-4 bottom-1/3 z-20"
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
            >
              <div className="bg-gradient-to-r from-purple-500 to-purple-400 text-white px-4 py-2 rounded-full text-sm font-semibold shadow-lg shadow-purple-500/20 flex items-center gap-2">
                <Sparkles className="h-4 w-4" />
                AI Optimized
              </div>
            </motion.div>

            <motion.div
              className="absolute right-8 -bottom-4 z-20"
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
            >
              <div className="bg-gradient-to-r from-cyan-500 to-cyan-400 text-white px-4 py-2 rounded-full text-sm font-semibold shadow-lg shadow-cyan-500/20 flex items-center gap-2">
                <Zap className="h-4 w-4" />
                Ready to Export
              </div>
            </motion.div>

            {/* Background decoration */}
            <div className="absolute -inset-4 bg-gradient-to-r from-teal-500/15 to-purple-500/15 rounded-3xl blur-3xl -z-10" />
          </motion.div>
        </div>
      </div>
    </section>
  )
}
