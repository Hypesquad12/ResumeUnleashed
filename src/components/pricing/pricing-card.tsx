'use client'

import { Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { PricingPlan, BillingCycle, formatPrice, calculateSavings } from '@/lib/pricing-config'
import { cn } from '@/lib/utils'

interface PricingCardProps {
  plan: PricingPlan
  billingCycle: BillingCycle
  onSelect: (plan: PricingPlan, billingCycle: BillingCycle) => void
  isLoading?: boolean
}

export function PricingCard({ plan, billingCycle, onSelect, isLoading }: PricingCardProps) {
  const price = billingCycle === 'monthly' ? plan.priceMonthly : plan.priceAnnual
  const originalPrice = billingCycle === 'monthly' ? plan.originalPriceMonthly : plan.originalPriceAnnual
  const trialDays = billingCycle === 'monthly' ? plan.trialDays : plan.trialDaysAnnual
  const displayPrice = formatPrice(price, plan.currency)
  const displayOriginalPrice = originalPrice ? formatPrice(originalPrice, plan.currency) : null
  
  const savings = billingCycle === 'annual' 
    ? calculateSavings(plan.priceMonthly, plan.priceAnnual)
    : null

  const features = [
    plan.features.templates === 'all' 
      ? 'All 25+ professional templates'
      : `${plan.features.templates} professional template${plan.features.templates > 1 ? 's' : ''}`,
    
    plan.features.aiCustomization 
      ? `${plan.limits.customizations === -1 ? 'Unlimited' : plan.limits.customizations} AI customizations/month`
      : 'No AI customization',
    
    plan.features.interviewPrep === 'unlimited'
      ? 'Unlimited interview prep sessions'
      : plan.features.interviewPrep
      ? `${plan.limits.interviews} interview prep sessions/month`
      : null,
    
    plan.features.atsOptimization === 'advanced'
      ? 'Advanced ATS optimization'
      : plan.features.atsOptimization
      ? 'Basic ATS optimization'
      : null,
    
    plan.features.visitingCards
      ? plan.features.visitingCards === 'unlimited'
        ? 'Unlimited digital visiting cards'
        : `${plan.features.visitingCards} digital visiting card${plan.features.visitingCards > 1 ? 's' : ''}`
      : null,
    
    plan.features.analytics ? 'Advanced analytics dashboard' : null,
    plan.features.coverLetter ? 'AI cover letter generation' : null,
    plan.features.resumeDistribution ? 'Resume distribution service' : null,
    plan.features.support,
  ].filter(Boolean) as string[]

  return (
    <Card className={cn(
      'relative flex flex-col',
      plan.popular && 'border-primary shadow-lg scale-105'
    )}>
      {plan.badge && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2">
          <Badge className="bg-primary text-primary-foreground px-4 py-1">
            {plan.badge}
          </Badge>
        </div>
      )}
      
      <CardHeader>
        <CardTitle className="text-2xl">{plan.name}</CardTitle>
        <CardDescription>
          {displayOriginalPrice && (
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-lg text-muted-foreground line-through">
                {displayOriginalPrice}
              </span>
              <span className="text-sm font-semibold text-green-600 dark:text-green-400">
                Save {originalPrice && Math.round((1 - price / originalPrice) * 100)}%
              </span>
            </div>
          )}
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-4xl font-bold text-foreground">
              {displayPrice}
            </span>
            <span className="text-muted-foreground">
              /{billingCycle === 'monthly' ? 'month' : 'year'}
            </span>
          </div>
          {trialDays && (
            <div className="mt-2 text-sm font-medium text-primary">
              {trialDays}-day free trial included
            </div>
          )}
          {savings && (
            <div className="mt-2 text-sm text-green-600 dark:text-green-400">
              Save {formatPrice(savings.amount, plan.currency)} ({savings.percentage}% off)
            </div>
          )}
        </CardDescription>
      </CardHeader>

      <CardContent className="flex-1">
        <ul className="space-y-3">
          {features.map((feature, index) => (
            <li key={index} className="flex items-start gap-3">
              <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
              <span className="text-sm">{feature}</span>
            </li>
          ))}
        </ul>
      </CardContent>

      <CardFooter>
        <Button
          className="w-full"
          size="lg"
          variant={plan.popular ? 'default' : 'outline'}
          onClick={() => onSelect(plan, billingCycle)}
          disabled={isLoading}
        >
          {trialDays ? `Start ${trialDays}-Day Trial` : 'Get Started'}
        </Button>
      </CardFooter>
    </Card>
  )
}
