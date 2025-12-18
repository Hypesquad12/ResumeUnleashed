'use client'

import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Check, Sparkles, Zap, Crown, ChevronDown, ChevronUp, Gift } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'

const plans = [
  {
    name: 'Free',
    price: 0,
    period: '',
    description: 'Try it out, no credit card required',
    icon: Gift,
    popular: false,
    savings: null,
    isFree: true,
    freeFeatures: [
      '1 resume creation',
      '1 AI customization',
      '1 cover letter',
      '3 basic templates',
      'ATS score check',
      'PDF export',
    ],
  },
  {
    name: 'Monthly',
    price: 20,
    period: '/month',
    description: 'Perfect for job seekers actively applying',
    icon: Zap,
    popular: false,
    savings: null,
    isFree: false,
  },
  {
    name: 'Quarterly',
    price: 49.99,
    period: '/3 months',
    description: 'Best for extended job searches',
    icon: Sparkles,
    popular: true,
    savings: 'Save 17%',
    isFree: false,
  },
  {
    name: 'Annual',
    price: 149.99,
    period: '/year',
    description: 'Maximum value for career growth',
    icon: Crown,
    popular: false,
    savings: 'Save 38%',
    isFree: false,
  },
]

const paidFeatures = [
  'Unlimited resume creations',
  'Unlimited AI customizations',
  'Unlimited cover letters',
  'All premium templates',
  'ATS optimization & scoring',
  'AI-powered keyword matching',
  'Digital business cards',
  'QR code generation',
  'Shareable resume links',
  'Real-time preview',
  'PDF, DOCX, TXT exports',
  'AI interview prep',
  'Priority support',
]

export function PricingSection() {
  const [hoveredPlan, setHoveredPlan] = useState<number | null>(null)
  const [expandedPlan, setExpandedPlan] = useState<number | null>(null)

  return (
    <section id="pricing" className="py-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-violet-50/50 to-transparent" />
      
      <div className="max-w-7xl mx-auto relative z-10">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-violet-50 border border-violet-200 mb-6">
            <Crown className="h-4 w-4 text-violet-600" />
            <span className="text-sm font-medium text-violet-700">Simple Pricing</span>
          </div>
          
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-800">
            Start free,
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-indigo-600"> upgrade anytime</span>
          </h2>
          <p className="mt-4 text-lg text-slate-600 max-w-2xl mx-auto">
            Try our free plan with no credit card required. Upgrade for unlimited access.
          </p>
        </motion.div>

        {/* Pricing cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-4 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              onMouseEnter={() => setHoveredPlan(index)}
              onMouseLeave={() => setHoveredPlan(null)}
              className="relative"
            >
              {/* Popular badge */}
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
                  <div className="px-4 py-1.5 rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-sm font-medium shadow-lg">
                    Most Popular
                  </div>
                </div>
              )}
              
              {/* Card glow */}
              {plan.popular && (
                <div className="absolute -inset-1 bg-gradient-to-r from-violet-500 to-indigo-500 rounded-3xl blur-lg opacity-30" />
              )}
              
              <div className={`relative h-full p-6 rounded-2xl border-2 transition-all duration-300 ${
                plan.popular 
                  ? 'bg-white border-violet-300 shadow-xl' 
                  : 'bg-white/80 border-slate-200 hover:border-slate-300 hover:shadow-lg'
              }`}>
                {/* Plan icon & name */}
                <div className="flex items-center gap-3 mb-4">
                  <div className={`p-2.5 rounded-xl ${
                    plan.popular 
                      ? 'bg-gradient-to-br from-violet-500 to-indigo-600' 
                      : 'bg-slate-100'
                  }`}>
                    <plan.icon className={`h-5 w-5 ${plan.popular ? 'text-white' : 'text-slate-600'}`} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-800">{plan.name}</h3>
                    {plan.savings && (
                      <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                        {plan.savings}
                      </span>
                    )}
                  </div>
                </div>
                
                {/* Price */}
                <div className="mb-4">
                  <div className="flex items-baseline gap-1">
                    {plan.isFree ? (
                      <span className="text-4xl font-bold text-slate-900">Free</span>
                    ) : (
                      <>
                        <span className="text-4xl font-bold text-slate-900">${plan.price}</span>
                        <span className="text-slate-500">{plan.period}</span>
                      </>
                    )}
                  </div>
                  <p className="text-sm text-slate-500 mt-1">{plan.description}</p>
                </div>
                
                {/* CTA Button */}
                <Link href="/signup" className="block mb-6">
                  <Button 
                    className={`w-full ${
                      plan.popular 
                        ? 'bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white shadow-lg shadow-violet-500/25' 
                        : plan.isFree
                        ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                        : 'bg-slate-900 hover:bg-slate-800 text-white'
                    }`}
                    size="lg"
                  >
                    {plan.isFree ? 'Start Free' : 'Get Started'}
                  </Button>
                </Link>
                
                {/* Features preview */}
                <div className="pt-4 border-t border-slate-100">
                  <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-3">
                    {plan.isFree ? 'Includes:' : 'Everything included:'}
                  </p>
                  <ul className="space-y-2">
                    {plan.isFree ? (
                      plan.freeFeatures?.map((feature: string) => (
                        <li key={feature} className="flex items-center gap-2 text-sm text-slate-600">
                          <Check className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                          {feature}
                        </li>
                      ))
                    ) : (
                      (expandedPlan === index ? paidFeatures : paidFeatures.slice(0, 5)).map((feature: string) => (
                        <li key={feature} className="flex items-center gap-2 text-sm text-slate-600">
                          <Check className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                          {feature}
                        </li>
                      ))
                    )}
                  </ul>
                  {!plan.isFree && (
                    <button
                      onClick={() => setExpandedPlan(expandedPlan === index ? null : index)}
                      className="flex items-center gap-1 text-sm text-violet-600 font-medium mt-3 hover:text-violet-700 transition-colors"
                    >
                      {expandedPlan === index ? (
                        <>
                          <ChevronUp className="h-4 w-4" />
                          Show less
                        </>
                      ) : (
                        <>
                          <ChevronDown className="h-4 w-4" />
                          + {paidFeatures.length - 5} more features
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Full features list */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mt-16 max-w-4xl mx-auto"
        >
          <div className="text-center mb-8">
            <h3 className="text-xl font-semibold text-slate-800">Paid plans include</h3>
            <p className="text-slate-500 mt-1">Full access to every feature, unlimited usage</p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {paidFeatures.map((feature: string, index: number) => (
              <motion.div
                key={feature}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className="flex items-center gap-2 p-3 rounded-xl bg-white border border-slate-100 hover:border-violet-200 hover:shadow-md transition-all"
              >
                <div className="p-1 rounded-full bg-emerald-100">
                  <Check className="h-3.5 w-3.5 text-emerald-600" />
                </div>
                <span className="text-sm text-slate-700">{feature}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Money back guarantee */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-12 text-center"
        >
          <p className="text-slate-500 text-sm">
            🛡️ <span className="font-medium">30-day money-back guarantee</span> • Cancel anytime • No questions asked
          </p>
        </motion.div>
      </div>
    </section>
  )
}
