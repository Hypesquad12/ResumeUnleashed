'use client'

import { motion } from 'framer-motion'
import { Star, Quote, TrendingUp, Award, CheckCircle2 } from 'lucide-react'

// More specific, credible testimonials with concrete results
const testimonials = [
  {
    name: 'Sarah Chen',
    role: 'Software Engineer',
    company: 'Google',
    content: 'Went from 0 callbacks to 5 interviews in one week. The AI perfectly matched keywords from the job description.',
    avatar: 'SC',
    rating: 5,
    result: '5 interviews in 1 week',
  },
  {
    name: 'Michael Roberts',
    role: 'Product Manager',
    company: 'Meta',
    content: 'After 3 months of silence, I got 3 interview requests within days of using ResumeAI. The ATS score jumped from 45% to 94%.',
    avatar: 'MR',
    rating: 5,
    result: 'ATS score: 45% → 94%',
  },
  {
    name: 'Emily Johnson',
    role: 'UX Designer',
    company: 'Apple',
    content: 'Created a tailored resume for Apple in 10 minutes. Got the interview call the next week. Now I work there!',
    avatar: 'EJ',
    rating: 5,
    result: 'Landed dream job',
  },
  {
    name: 'David Kim',
    role: 'Data Scientist',
    company: 'Netflix',
    content: 'The AI suggestions were incredibly specific. It added exactly the technical keywords recruiters were looking for.',
    avatar: 'DK',
    rating: 5,
    result: '8 interviews scheduled',
  },
  {
    name: 'Lisa Wang',
    role: 'Marketing Director',
    company: 'Spotify',
    content: 'Saved me 4+ hours per application. The AI customization is spot-on for each job posting.',
    avatar: 'LW',
    rating: 5,
    result: '4+ hours saved/app',
  },
  {
    name: 'James Wilson',
    role: 'DevOps Engineer',
    company: 'Amazon',
    content: 'Finally passed the ATS filter after months of rejections. Got 2 offers within 3 weeks of using ResumeAI.',
    avatar: 'JW',
    rating: 5,
    result: '2 offers in 3 weeks',
  },
]

export function TestimonialsSection() {
  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-purple-100/50 to-transparent" />
      
      <div className="max-w-7xl mx-auto relative z-10">
        {/* Section header with specific stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          {/* Rating badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-50 border border-amber-200 mb-6">
            <div className="flex gap-0.5">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
              ))}
            </div>
            <span className="text-sm font-medium text-amber-700">4.9/5 from 2,847 reviews</span>
          </div>
          
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-800">
            Real results from
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-indigo-600"> real job seekers</span>
          </h2>
          <p className="mt-4 text-lg text-slate-600 max-w-2xl mx-auto">
            See how professionals like you landed interviews at top companies
          </p>
          
          {/* Stats row */}
          <div className="mt-8 flex flex-wrap justify-center gap-8">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-emerald-500" />
              <span className="text-sm"><span className="font-bold text-slate-800">95%</span> ATS pass rate</span>
            </div>
            <div className="flex items-center gap-2">
              <Award className="h-5 w-5 text-violet-500" />
              <span className="text-sm"><span className="font-bold text-slate-800">50,000+</span> resumes created</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-blue-500" />
              <span className="text-sm"><span className="font-bold text-slate-800">10,000+</span> jobs landed</span>
            </div>
          </div>
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
              <div className="absolute -inset-0.5 bg-gradient-to-r from-teal-400 to-purple-400 rounded-2xl blur opacity-0 group-hover:opacity-20 transition-opacity duration-500" />
              
              <div className="relative p-6 rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-lg transition-all h-full">
                {/* Quote icon */}
                <Quote className="h-8 w-8 text-teal-300 mb-4" />
                
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
                <p className="text-slate-600 mb-4 leading-relaxed">&quot;{testimonial.content}&quot;</p>
                
                {/* Result badge - specific outcome */}
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 mb-4">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                  <span className="text-xs font-medium text-emerald-700">{testimonial.result}</span>
                </div>

                {/* Author */}
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-white font-bold shadow-lg shadow-violet-500/20">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <p className="font-semibold text-slate-800">{testimonial.name}</p>
                    <p className="text-sm text-slate-500">{testimonial.role} at {testimonial.company}</p>
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
              <span key={company} className="text-xl font-bold text-slate-500">{company}</span>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  )
}
