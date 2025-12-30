'use client'

import { motion } from 'framer-motion'
import { Users, Briefcase, Star, TrendingUp, CheckCircle, Award } from 'lucide-react'
import { useEffect, useState } from 'react'

function AnimatedCounter({ end, duration = 2, suffix = '', prefix = '' }: { end: number; duration?: number; suffix?: string; prefix?: string }) {
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
  
  return <span>{prefix}{count.toLocaleString()}{suffix}</span>
}

const stats = [
  {
    icon: Users,
    value: 10000,
    suffix: '+',
    label: 'Active Users',
    description: 'Professionals trust our platform',
    gradient: 'from-violet-500 to-purple-500',
  },
  {
    icon: Briefcase,
    value: 95,
    suffix: '%',
    label: 'Interview Rate',
    description: 'Users get interview calls',
    gradient: 'from-emerald-500 to-teal-500',
  },
  {
    icon: Star,
    value: 4.9,
    suffix: '/5',
    label: 'User Rating',
    description: 'Based on 2,500+ reviews',
    gradient: 'from-amber-500 to-orange-500',
  },
  {
    icon: TrendingUp,
    value: 3,
    suffix: 'x',
    label: 'Faster Results',
    description: 'Land jobs 3x faster',
    gradient: 'from-blue-500 to-cyan-500',
  },
]

const achievements = [
  { icon: CheckCircle, text: 'ATS-Optimized Templates' },
  { icon: Award, text: 'Industry-Leading AI' },
  { icon: CheckCircle, text: 'Real-Time Feedback' },
  { icon: Award, text: 'Expert-Approved Content' },
]

export function StatsSection() {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-slate-50 via-white to-violet-50 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] -z-10" />
      <div className="absolute top-0 right-0 w-96 h-96 bg-violet-200/30 rounded-full blur-3xl -z-10" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-200/30 rounded-full blur-3xl -z-10" />
      
      <div className="max-w-7xl mx-auto">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 mb-4">
            Trusted by <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-indigo-600">Thousands</span> of Job Seekers
          </h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Join the community of professionals who transformed their job search with AI
          </p>
        </motion.div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ y: -8, scale: 1.02 }}
              className="relative group"
            >
              <div className="relative p-6 rounded-2xl bg-white border border-slate-200 shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden">
                {/* Gradient glow on hover */}
                <div className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />
                
                <div className="relative">
                  <motion.div
                    className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}
                  >
                    <stat.icon className="h-6 w-6 text-white" />
                  </motion.div>
                  
                  <div className="text-3xl sm:text-4xl font-bold text-slate-900 mb-1">
                    <AnimatedCounter end={stat.value} suffix={stat.suffix} duration={2.5} />
                  </div>
                  
                  <div className="text-sm font-semibold text-slate-700 mb-1">
                    {stat.label}
                  </div>
                  
                  <div className="text-xs text-slate-500">
                    {stat.description}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Achievements badges */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex flex-wrap justify-center gap-4 mt-12"
        >
          {achievements.map((achievement, index) => (
            <motion.div
              key={achievement.text}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.05 }}
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-slate-200 shadow-sm hover:shadow-md transition-all cursor-default"
            >
              <achievement.icon className="h-4 w-4 text-emerald-500" />
              <span className="text-sm font-medium text-slate-700">{achievement.text}</span>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
