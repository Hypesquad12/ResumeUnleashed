'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Check, Sparkles, Zap, Crown, Gift } from 'lucide-react'
import Link from 'next/link'
import { detectUserRegion } from '@/lib/geo-detection'
import type { Region } from '@/lib/pricing-config'

export function PricingSection() {
  const [region, setRegion] = useState<Region>('row')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function detectRegion() {
      try {
        const detected = await detectUserRegion()
        setRegion(detected)
      } catch (error) {
        console.error('Failed to detect region:', error)
        setRegion('row')
      } finally {
        setIsLoading(false)
      }
    }
    detectRegion()
  }, [])

  // Define plans based on region
  const plans = region === 'india' ? [
    {
      name: 'Professional',
      price: 499,
      originalPrice: 700,
      period: '/month',
      description: 'Perfect for active job seekers',
      icon: Zap,
      popular: false,
      savings: '7-day free trial',
      isFree: false,
      currency: '₹',
      trialDays: 7,
      tierFeatures: [
        '10 professional templates',
        '10 AI customizations/month',
        '2 interview prep sessions',
        '1 digital visiting card',
        'Email support (48hr)',
      ],
    },
    {
      name: 'Premium',
      price: 899,
      originalPrice: 1200,
      period: '/month',
      description: 'Best value for serious professionals',
      icon: Sparkles,
      popular: true,
      savings: 'BEST VALUE',
      isFree: false,
      currency: '₹',
      trialDays: 7,
      tierFeatures: [
        'All 25+ templates',
        '50 AI customizations/month',
        '10 interview prep sessions',
        'Unlimited job matching',
        '10 digital visiting cards',
        'AI cover letters',
        'Priority support',
      ],
    },
    {
      name: 'Ultimate',
      price: 1199,
      originalPrice: 1599,
      period: '/month',
      description: 'Maximum features for career growth',
      icon: Crown,
      popular: false,
      savings: '7-day free trial',
      isFree: false,
      currency: '₹',
      trialDays: 7,
      tierFeatures: [
        'Everything in Premium',
        'Unlimited AI customizations',
        'Unlimited interview prep',
        'Unlimited visiting cards',
        'LinkedIn optimization',
        'Analytics dashboard',
        'Resume distribution',
        'Dedicated support',
      ],
    },
  ] : [
    {
      name: 'Professional',
      price: 5.60,
      originalPrice: 7.87,
      period: '/month',
      description: 'Perfect for active job seekers',
      icon: Zap,
      popular: false,
      savings: '7-day free trial',
      isFree: false,
      currency: '$',
      trialDays: 7,
      tierFeatures: [
        '10 professional templates',
        '10 AI customizations/month',
        '2 interview prep sessions',
        '1 digital visiting card',
        'Email support (48hr)',
      ],
    },
    {
      name: 'Premium',
      price: 10.11,
      originalPrice: 13.48,
      period: '/month',
      description: 'Best value for serious professionals',
      icon: Sparkles,
      popular: true,
      savings: 'BEST VALUE',
      isFree: false,
      currency: '$',
      trialDays: 7,
      tierFeatures: [
        'All 25+ templates',
        '50 AI customizations/month',
        '10 interview prep sessions',
        'Unlimited job matching',
        '10 digital visiting cards',
        'AI cover letters',
        'Priority support',
      ],
    },
    {
      name: 'Ultimate',
      price: 13.47,
      originalPrice: 17.97,
      period: '/month',
      description: 'Maximum features for career growth',
      icon: Crown,
      popular: false,
      savings: '7-day free trial',
      isFree: false,
      currency: '$',
      trialDays: 7,
      tierFeatures: [
        'Everything in Premium',
        'Unlimited AI customizations',
        'Unlimited interview prep',
        'Unlimited visiting cards',
        'LinkedIn optimization',
        'Analytics dashboard',
        'Resume distribution',
        'Dedicated support',
      ],
    },
  ]

  const paidFeatures = [
    'AI-powered customization',
    'Multiple resume versions',
    'All premium templates',
    'ATS optimization',
    'Job matching',
    'Interview preparation',
    'Digital business cards',
    'QR code generation',
    'Shareable resume links',
    'Analytics dashboard',
    'LinkedIn optimization',
    'Cover letter generation',
    'Priority support',
  ]

  if (isLoading) {
    return (
      <section id="pricing" className="py-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-violet-50/50 to-transparent" />
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center">
            <div className="h-8 w-8 animate-spin mx-auto border-4 border-violet-600 border-t-transparent rounded-full" />
          </div>
        </div>
      </section>
    )
  }

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
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 mb-4">
            Simple, transparent{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-indigo-600">
              pricing
            </span>
          </h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Choose the perfect plan for your career journey. All plans start with a free trial.
          </p>
        </motion.div>

        {/* Pricing cards */}
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
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

              {/* Card */}
              <div className={`relative h-full bg-white rounded-2xl shadow-lg border-2 transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 ${
                plan.popular 
                  ? 'border-violet-500 shadow-violet-500/20' 
                  : 'border-slate-200 hover:border-violet-300'
              }`}>
                <div className="p-6 flex flex-col h-full">
                  {/* Icon & Name */}
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`p-2 rounded-xl ${
                      plan.popular 
                        ? 'bg-gradient-to-br from-violet-500 to-indigo-600' 
                        : 'bg-slate-100'
                    }`}>
                      <plan.icon className={`h-5 w-5 ${plan.popular ? 'text-white' : 'text-slate-600'}`} />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-slate-900">{plan.name}</h3>
                      {plan.savings && (
                        <span className="text-xs font-medium text-emerald-600">{plan.savings}</span>
                      )}
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-sm text-slate-600 mb-4">{plan.description}</p>

                  {/* Price */}
                  <div className="mb-6">
                    {plan.originalPrice && (
                      <div className="flex items-baseline gap-2 mb-1">
                        <span className="text-lg text-slate-400 line-through">{plan.currency}{plan.originalPrice.toLocaleString()}</span>
                        <span className="text-sm font-semibold text-emerald-600">Save {Math.round((1 - plan.price / plan.originalPrice) * 100)}%</span>
                      </div>
                    )}
                    <div className="flex items-baseline gap-1">
                      <span className="text-2xl font-bold text-slate-900">{plan.currency}</span>
                      <span className="text-4xl font-bold text-slate-900">
                        {plan.price.toLocaleString()}
                      </span>
                      <span className="text-slate-600">{plan.period}</span>
                    </div>
                    {plan.trialDays && (
                      <p className="text-sm text-violet-600 font-medium mt-2">{plan.trialDays}-day free trial included</p>
                    )}
                  </div>

                  {/* CTA Button */}
                  <Link href='/pricing' className="block mb-6">
                    <Button 
                      className={`w-full ${
                        plan.popular
                          ? 'bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white shadow-lg shadow-violet-500/30'
                          : 'bg-slate-900 hover:bg-slate-800 text-white'
                      }`}
                      size="lg"
                    >
                      Start {plan.trialDays}-Day Trial
                    </Button>
                  </Link>
                  
                  {/* Features preview */}
                  <div className="pt-4 border-t border-slate-100">
                    <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-3">
                      Everything included:
                    </p>
                    <ul className="space-y-2">
                      {plan.tierFeatures?.map((feature: string) => (
                        <li key={feature} className="flex items-center gap-2 text-sm text-slate-600">
                          <Check className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
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
          className="mt-16 text-center"
        >
          <h3 className="text-xl font-bold text-slate-900 mb-6">Paid plans include</h3>
          <p className="text-slate-600 mb-8">Full access to every feature, unlimited usage</p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl mx-auto">
            {paidFeatures.map((feature) => (
              <div key={feature} className="flex items-center gap-2 text-sm text-slate-700">
                <Check className="h-4 w-4 text-violet-600 flex-shrink-0" />
                {feature}
              </div>
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
          <div className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-50 border border-emerald-200 rounded-full">
            <Check className="h-5 w-5 text-emerald-600" />
            <span className="text-sm font-medium text-emerald-700">
              Free trial on all plans • Cancel anytime • No commitment required
            </span>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
