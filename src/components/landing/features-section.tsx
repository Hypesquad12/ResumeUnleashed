'use client'

import { motion } from 'framer-motion'
import { FileText, Sparkles, CreditCard, QrCode, Zap, Shield, Globe, Target } from 'lucide-react'
import { useState } from 'react'

const features = [
  {
    icon: FileText,
    title: 'Smart Resume Builder',
    description: 'Create professional resumes with our intuitive drag-and-drop builder. Choose from dozens of ATS-friendly templates.',
    gradient: 'from-blue-500 to-blue-400',
    color: 'blue',
  },
  {
    icon: Sparkles,
    title: 'AI-Powered Optimization',
    description: 'Let AI analyze job descriptions and tailor your resume with the right keywords to pass ATS systems.',
    gradient: 'from-indigo-500 to-indigo-400',
    color: 'violet',
  },
  {
    icon: CreditCard,
    title: 'Digital Business Cards',
    description: 'Create stunning digital cards with your contact info, social links, and a QR code for instant sharing.',
    gradient: 'from-emerald-500 to-emerald-400',
    color: 'emerald',
  },
  {
    icon: QrCode,
    title: 'One-Click Sharing',
    description: 'Generate QR codes and shareable links. Track views and engagement with built-in analytics.',
    gradient: 'from-amber-500 to-amber-400',
    color: 'orange',
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
    <section id="features" className="py-24 px-4 sm:px-6 lg:px-8 relative">
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
          <span className="text-primary font-semibold text-sm uppercase tracking-wider">Features</span>
          <h2 className="mt-4 text-3xl sm:text-4xl lg:text-5xl font-bold text-white">
            Everything You Need to
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400"> Stand Out</span>
          </h2>
          <p className="mt-4 text-lg text-slate-400 max-w-2xl mx-auto">
            Powerful tools designed to help you create, customize, and share your professional profile
          </p>
        </motion.div>

        {/* Main features grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-16">
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
                className={`absolute -inset-0.5 bg-gradient-to-r ${feature.gradient} rounded-2xl blur opacity-0 group-hover:opacity-30 transition-opacity duration-500`}
                animate={{
                  scale: hoveredIndex === index ? 1.02 : 1,
                }}
              />
              
              <div className="relative p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm hover:bg-white/10 hover:border-white/20 transition-all duration-300 h-full">
                <motion.div
                  className={`p-3 rounded-xl w-fit mb-4 bg-gradient-to-br ${feature.gradient}`}
                  whileHover={{ rotate: [0, -10, 10, 0], scale: 1.1 }}
                  transition={{ duration: 0.5 }}
                >
                  <feature.icon className="h-6 w-6 text-white" />
                </motion.div>
                
                <h3 className="text-xl font-semibold text-white mb-2 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-slate-300 transition-all">
                  {feature.title}
                </h3>
                <p className="text-slate-400 text-sm leading-relaxed">{feature.description}</p>
                
                {/* Animated arrow */}
                <motion.div
                  className="mt-4 flex items-center text-primary text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity"
                  initial={{ x: -10 }}
                  whileHover={{ x: 0 }}
                >
                  Learn more
                  <motion.span
                    animate={{ x: hoveredIndex === index ? [0, 5, 0] : 0 }}
                    transition={{ duration: 1, repeat: Infinity }}
                    className="ml-1"
                  >
                    →
                  </motion.span>
                </motion.div>
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
              whileHover={{ y: -5, scale: 1.02 }}
              className="p-4 rounded-xl bg-white/5 border border-white/10 text-center hover:bg-white/10 transition-all cursor-pointer"
            >
              <feature.icon className="h-5 w-5 text-primary mx-auto mb-2" />
              <h4 className="font-medium text-white text-sm">{feature.title}</h4>
              <p className="text-xs text-slate-500 mt-1">{feature.description}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
