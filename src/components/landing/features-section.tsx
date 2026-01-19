'use client'

import { motion } from 'framer-motion'
import { FileText, Sparkles, CreditCard, QrCode, Zap, Shield, Globe, Target, Mic, MessageSquare } from 'lucide-react'
import { useState } from 'react'

const features = [
  {
    icon: FileText,
    title: 'AI Resume Creator & CV Maker AI',
    description: 'Create professional resumes with our intuitive resume ai builder and resume maker ai. Choose from dozens of ATS-friendly templates.',
    gradient: 'from-violet-500 to-indigo-500',
  },
  {
    icon: Sparkles,
    title: 'ATS Optimisation & Resume AI',
    description: 'Let our resume generator ai analyze job descriptions and tailor your artificial intelligence resume with the right keywords to pass ATS systems.',
    gradient: 'from-violet-500 to-purple-500',
  },
  {
    icon: Mic,
    title: 'AI Interview & Interview with AI',
    description: 'Practice with AI-powered mock interviews. Experience a realistic interview with ai, getting real-time feedback and personalized questions.',
    gradient: 'from-emerald-500 to-teal-500',
  },
  {
    icon: MessageSquare,
    title: 'Voice Conversations',
    description: 'Natural voice-based interview practice. Speak your answers and receive instant AI feedback to improve your responses.',
    gradient: 'from-amber-500 to-orange-500',
  },
  {
    icon: CreditCard,
    title: 'Digital Business Cards',
    description: 'Create stunning digital cards with your contact info, social links, and a QR code for instant sharing.',
    gradient: 'from-cyan-500 to-teal-500',
  },
  {
    icon: QrCode,
    title: 'One-Click Sharing',
    description: 'Generate QR codes and shareable links. Track views and engagement with built-in analytics.',
    gradient: 'from-rose-500 to-pink-500',
  },
]

const additionalFeatures = [
  { icon: Zap, title: 'Lightning Fast', description: 'Build your resume in minutes, not hours' },
  { icon: Shield, title: 'Privacy First', description: 'Your data is encrypted and secure' },
  { icon: Globe, title: 'Export Anywhere', description: 'PDF, DOCX, or share via link' },
  { icon: Target, title: 'Job Matching', description: 'AI matches your skills to job requirements' },
]

export function FeaturesSection() {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)

  return (
    <section id="features" className="py-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-transparent" />
      
      <div className="max-w-7xl mx-auto relative z-10">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <motion.span 
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="inline-block px-4 py-2 rounded-full bg-gradient-to-r from-violet-100 to-purple-100 text-violet-700 font-semibold text-sm uppercase tracking-wider mb-4"
          >
            ✨ Powerful Features
          </motion.span>
          <h2 className="mt-4 text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 leading-tight">
            Everything You Need to{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600">
              Land Interviews
            </span>
          </h2>
          <p className="mt-6 text-lg sm:text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
            From AI-powered resume customization to interview prep and digital networking—all in one platform
          </p>
        </motion.div>

        {/* Main features grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-16">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
              className="group relative"
            >
              {/* Glow effect */}
              <motion.div
                className={`absolute -inset-0.5 bg-gradient-to-r ${feature.gradient} rounded-2xl blur opacity-0 group-hover:opacity-40 transition-opacity duration-500`}
                animate={{
                  scale: hoveredIndex === index ? 1.02 : 1,
                }}
              />
              
              <div className="relative p-6 rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-xl hover:border-slate-300 transition-all duration-300 h-full overflow-hidden">
                <motion.div
                  className={`p-3 rounded-xl w-fit mb-4 bg-gradient-to-br ${feature.gradient}`}
                  whileHover={{ rotate: [0, -10, 10, 0], scale: 1.1 }}
                  transition={{ duration: 0.5 }}
                >
                  <feature.icon className="h-6 w-6 text-white" />
                </motion.div>
                
                <h3 className="text-xl font-semibold text-slate-800 mb-2 transition-all">
                  {feature.title}
                </h3>
                <p className="text-slate-600 text-sm leading-relaxed">{feature.description}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Additional features */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4"
        >
          {additionalFeatures.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              whileHover={{ y: -8, scale: 1.05 }}
              className="relative p-4 rounded-xl bg-white border border-slate-200 shadow-sm text-center hover:shadow-lg hover:border-slate-300 transition-all cursor-pointer group overflow-hidden"
            >
              <div className="relative">
                <motion.div
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.5 }}
                >
                  <feature.icon className="h-6 w-6 text-primary mx-auto mb-2" />
                </motion.div>
                <h4 className="font-medium text-slate-800 text-sm">{feature.title}</h4>
                <p className="text-xs text-slate-500 mt-1">{feature.description}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
