'use client'

import { motion } from 'framer-motion'
import { Star, Quote } from 'lucide-react'

const testimonials = [
  {
    name: 'Sarah Chen',
    role: 'Software Engineer',
    company: 'Google',
    content: 'ResumeAI helped me land my dream job! The AI suggestions were spot-on and the ATS optimization made all the difference.',
    avatar: 'SC',
    rating: 5,
  },
  {
    name: 'Michael Roberts',
    role: 'Product Manager',
    company: 'Meta',
    content: 'The ATS optimization feature is a game-changer. I went from getting no callbacks to landing 5 interviews in a week!',
    avatar: 'MR',
    rating: 5,
  },
  {
    name: 'Emily Johnson',
    role: 'UX Designer',
    company: 'Apple',
    content: 'Beautiful templates and super easy to use. The digital business card feature is perfect for networking events.',
    avatar: 'EJ',
    rating: 5,
  },
  {
    name: 'David Kim',
    role: 'Data Scientist',
    company: 'Netflix',
    content: 'The AI tailoring feature saved me hours of work. It perfectly matched my resume to each job description.',
    avatar: 'DK',
    rating: 5,
  },
  {
    name: 'Lisa Wang',
    role: 'Marketing Director',
    company: 'Spotify',
    content: 'Finally, a resume builder that understands modern job hunting. The QR code feature is brilliant!',
    avatar: 'LW',
    rating: 5,
  },
  {
    name: 'James Wilson',
    role: 'DevOps Engineer',
    company: 'Amazon',
    content: 'Clean, professional templates that actually pass ATS systems. Worth every penny!',
    avatar: 'JW',
    rating: 5,
  },
]

export function TestimonialsSection() {
  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-violet-500/5 to-transparent" />
      
      <div className="max-w-7xl mx-auto relative z-10">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <span className="text-primary font-semibold text-sm uppercase tracking-wider">Testimonials</span>
          <h2 className="mt-4 text-3xl sm:text-4xl lg:text-5xl font-bold text-white">
            Loved by
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400"> Professionals</span>
          </h2>
          <p className="mt-4 text-lg text-slate-400 max-w-2xl mx-auto">
            Join thousands of job seekers who have landed their dream jobs with ResumeAI
          </p>
        </motion.div>

        {/* Testimonials grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ y: -5, scale: 1.02 }}
              className="group relative"
            >
              {/* Card glow */}
              <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-2xl blur opacity-0 group-hover:opacity-20 transition-opacity duration-500" />
              
              <div className="relative p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm hover:bg-white/10 transition-all h-full">
                {/* Quote icon */}
                <Quote className="h-8 w-8 text-primary/30 mb-4" />
                
                {/* Rating */}
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, scale: 0 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.3, delay: index * 0.1 + i * 0.05 }}
                    >
                      <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                    </motion.div>
                  ))}
                </div>

                {/* Content */}
                <p className="text-slate-300 mb-6 leading-relaxed">&quot;{testimonial.content}&quot;</p>

                {/* Author */}
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-white font-bold shadow-lg shadow-blue-500/25">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <p className="font-semibold text-white">{testimonial.name}</p>
                    <p className="text-sm text-slate-400">{testimonial.role} at {testimonial.company}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Trust badges */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mt-16 text-center"
        >
          <p className="text-slate-500 text-sm mb-6">Trusted by professionals from</p>
          <div className="flex flex-wrap justify-center items-center gap-8 opacity-50">
            {['Google', 'Meta', 'Apple', 'Amazon', 'Netflix', 'Spotify'].map((company) => (
              <span key={company} className="text-xl font-bold text-slate-400">{company}</span>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  )
}
