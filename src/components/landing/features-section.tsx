'use client'

import { motion } from 'framer-motion'
import { FileText, Sparkles, CreditCard, QrCode, Zap, Shield, Globe, Target, Trophy, Star, Lock, Unlock, CheckCircle } from 'lucide-react'
import { useState } from 'react'

const features = [
  {
    icon: FileText,
    title: 'Smart Resume Builder',
    description: 'Create professional resumes with our intuitive drag-and-drop builder. Choose from dozens of ATS-friendly templates.',
    gradient: 'from-teal-500 to-teal-400',
    color: 'blue',
    xp: 100,
    level: 'Starter',
    unlocked: true,
  },
  {
    icon: Sparkles,
    title: 'AI-Powered Optimization',
    description: 'Let AI analyze job descriptions and tailor your resume with the right keywords to pass ATS systems.',
    gradient: 'from-purple-500 to-purple-400',
    color: 'violet',
    xp: 250,
    level: 'Pro',
    unlocked: true,
  },
  {
    icon: CreditCard,
    title: 'Digital Business Cards',
    description: 'Create stunning digital cards with your contact info, social links, and a QR code for instant sharing.',
    gradient: 'from-cyan-500 to-cyan-400',
    color: 'emerald',
    xp: 150,
    level: 'Starter',
    unlocked: true,
  },
  {
    icon: QrCode,
    title: 'One-Click Sharing',
    description: 'Generate QR codes and shareable links. Track views and engagement with built-in analytics.',
    gradient: 'from-rose-400 to-pink-400',
    color: 'orange',
    xp: 200,
    level: 'Pro',
    unlocked: true,
  },
]

const additionalFeatures = [
  { icon: Zap, title: 'Lightning Fast', description: 'Build your resume in minutes, not hours', bonus: '+50 XP' },
  { icon: Shield, title: 'Privacy First', description: 'Your data is encrypted and secure', bonus: 'Secure' },
  { icon: Globe, title: 'Export Anywhere', description: 'PDF, DOCX, or share via link', bonus: '+75 XP' },
  { icon: Target, title: 'Job Matching', description: 'AI matches your skills to job requirements', bonus: '+100 XP' },
]

// Skill tree data
const skillTree = [
  { name: 'Resume Basics', completed: true, xp: 100 },
  { name: 'ATS Optimization', completed: true, xp: 200 },
  { name: 'AI Enhancement', completed: false, xp: 300 },
  { name: 'Master Builder', completed: false, xp: 500 },
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
          <h2 className="mt-4 text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-800">
            Everything You Need to
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-500 to-purple-500"> Stand Out</span>
          </h2>
          <p className="mt-4 text-lg text-slate-600 max-w-2xl mx-auto">
            Powerful tools designed to help you create, customize, and share your professional profile
          </p>
        </motion.div>

        {/* Main features grid - Gamified */}
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
                className={`absolute -inset-0.5 bg-gradient-to-r ${feature.gradient} rounded-2xl blur opacity-0 group-hover:opacity-40 transition-opacity duration-500`}
                animate={{
                  scale: hoveredIndex === index ? 1.02 : 1,
                }}
              />
              
              <div className="relative p-6 rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-xl hover:border-slate-300 transition-all duration-300 h-full overflow-hidden">
                {/* XP Badge */}
                <motion.div
                  className="absolute top-3 right-3"
                  initial={{ scale: 0, rotate: -180 }}
                  whileInView={{ scale: 1, rotate: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.5 + index * 0.1, type: 'spring' }}
                >
                  <div className={`px-2 py-1 rounded-full bg-gradient-to-r ${feature.gradient} text-white text-xs font-bold flex items-center gap-1`}>
                    <Star className="h-3 w-3" />
                    +{feature.xp} XP
                  </div>
                </motion.div>

                {/* Level indicator */}
                <div className="absolute top-3 left-3">
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                    feature.level === 'Pro' 
                      ? 'bg-violet-100 text-violet-600' 
                      : 'bg-teal-100 text-teal-600'
                  }`}>
                    {feature.level}
                  </span>
                </div>

                <motion.div
                  className={`p-3 rounded-xl w-fit mb-4 mt-6 bg-gradient-to-br ${feature.gradient} relative`}
                  whileHover={{ rotate: [0, -10, 10, 0], scale: 1.1 }}
                  transition={{ duration: 0.5 }}
                >
                  <feature.icon className="h-6 w-6 text-white" />
                  {/* Unlock indicator */}
                  {feature.unlocked && (
                    <motion.div
                      className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.8 + index * 0.1 }}
                    >
                      <CheckCircle className="h-3 w-3 text-white" />
                    </motion.div>
                  )}
                </motion.div>
                
                <h3 className="text-xl font-semibold text-slate-800 mb-2 transition-all">
                  {feature.title}
                </h3>
                <p className="text-slate-600 text-sm leading-relaxed">{feature.description}</p>
                
                {/* Progress bar */}
                <div className="mt-4">
                  <div className="flex justify-between text-xs text-slate-500 mb-1">
                    <span>Mastery</span>
                    <span>{75 + index * 5}%</span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <motion.div
                      className={`h-full bg-gradient-to-r ${feature.gradient} rounded-full`}
                      initial={{ width: 0 }}
                      whileInView={{ width: `${75 + index * 5}%` }}
                      viewport={{ once: true }}
                      transition={{ duration: 1, delay: 0.5 + index * 0.1 }}
                    />
                  </div>
                </div>
                
                {/* Animated arrow */}
                <motion.div
                  className="mt-4 flex items-center text-primary text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity"
                  initial={{ x: -10 }}
                  whileHover={{ x: 0 }}
                >
                  Unlock Feature
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

        {/* Skill Tree Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-16 p-6 rounded-2xl bg-gradient-to-r from-slate-900 to-slate-800 text-white"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 flex items-center justify-center">
              <Trophy className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold">Skill Tree Progress</h3>
              <p className="text-sm text-slate-400">Unlock new abilities as you level up</p>
            </div>
          </div>
          
          <div className="flex items-center justify-between relative">
            {/* Connection line */}
            <div className="absolute top-1/2 left-0 right-0 h-1 bg-slate-700 -translate-y-1/2" />
            <motion.div 
              className="absolute top-1/2 left-0 h-1 bg-gradient-to-r from-emerald-400 to-teal-400 -translate-y-1/2"
              initial={{ width: 0 }}
              whileInView={{ width: '50%' }}
              viewport={{ once: true }}
              transition={{ duration: 1.5, delay: 0.5 }}
            />
            
            {skillTree.map((skill, index) => (
              <motion.div
                key={skill.name}
                className="relative z-10 flex flex-col items-center"
                initial={{ opacity: 0, scale: 0 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 + index * 0.2, type: 'spring' }}
              >
                <motion.div
                  className={`w-14 h-14 rounded-full flex items-center justify-center ${
                    skill.completed 
                      ? 'bg-gradient-to-r from-emerald-400 to-teal-400' 
                      : 'bg-slate-700 border-2 border-slate-600'
                  }`}
                  whileHover={{ scale: 1.1 }}
                >
                  {skill.completed ? (
                    <CheckCircle className="h-6 w-6 text-white" />
                  ) : (
                    <Lock className="h-5 w-5 text-slate-500" />
                  )}
                </motion.div>
                <div className="mt-2 text-center">
                  <div className={`text-xs font-medium ${skill.completed ? 'text-white' : 'text-slate-500'}`}>
                    {skill.name}
                  </div>
                  <div className={`text-xs ${skill.completed ? 'text-emerald-400' : 'text-slate-600'}`}>
                    +{skill.xp} XP
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Additional features - Power-ups style */}
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
              {/* Bonus badge */}
              <div className="absolute top-2 right-2">
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-gradient-to-r from-amber-400 to-orange-400 text-white">
                  {feature.bonus}
                </span>
              </div>
              
              {/* Shine effect on hover */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"
              />
              
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
