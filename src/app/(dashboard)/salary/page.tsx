'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { 
  DollarSign, TrendingUp, MapPin, Briefcase, Target,
  Sparkles, Copy, CheckCircle, Lightbulb, ArrowRight,
  BarChart3, Users, Building2, Loader2, Zap
} from 'lucide-react'

interface SalaryData {
  min: number
  max: number
  median: number
  percentile25: number
  percentile75: number
}

interface NegotiationTip {
  title: string
  description: string
  script?: string
}

const experienceLevels = [
  { value: 'entry', label: 'Entry Level (0-2 years)' },
  { value: 'mid', label: 'Mid Level (3-5 years)' },
  { value: 'senior', label: 'Senior (6-10 years)' },
  { value: 'lead', label: 'Lead/Staff (10+ years)' },
  { value: 'executive', label: 'Executive/Director' },
]

const locations = [
  { value: 'sf', label: 'San Francisco Bay Area', multiplier: 1.3 },
  { value: 'nyc', label: 'New York City', multiplier: 1.25 },
  { value: 'seattle', label: 'Seattle', multiplier: 1.2 },
  { value: 'austin', label: 'Austin', multiplier: 1.05 },
  { value: 'denver', label: 'Denver', multiplier: 1.0 },
  { value: 'chicago', label: 'Chicago', multiplier: 1.0 },
  { value: 'remote', label: 'Remote (US)', multiplier: 1.0 },
  { value: 'other', label: 'Other US City', multiplier: 0.9 },
]

const baseSalaries: Record<string, Record<string, number>> = {
  'software engineer': { entry: 85000, mid: 120000, senior: 160000, lead: 200000, executive: 250000 },
  'product manager': { entry: 90000, mid: 130000, senior: 170000, lead: 210000, executive: 280000 },
  'data scientist': { entry: 95000, mid: 135000, senior: 175000, lead: 220000, executive: 270000 },
  'ux designer': { entry: 70000, mid: 100000, senior: 140000, lead: 170000, executive: 200000 },
  'marketing manager': { entry: 60000, mid: 85000, senior: 120000, lead: 150000, executive: 200000 },
  'sales representative': { entry: 50000, mid: 75000, senior: 100000, lead: 130000, executive: 180000 },
  'project manager': { entry: 65000, mid: 90000, senior: 120000, lead: 150000, executive: 190000 },
  'default': { entry: 60000, mid: 85000, senior: 115000, lead: 145000, executive: 180000 },
}

const negotiationTips: NegotiationTip[] = [
  {
    title: 'Research First',
    description: 'Know the market rate before negotiating. Use this tool and sites like Glassdoor, Levels.fyi.',
  },
  {
    title: 'Never Give the First Number',
    description: 'Let the employer make the first offer. If pressed, give a range based on market data.',
    script: '"I\'d prefer to learn more about the role before discussing compensation. What\'s the budgeted range for this position?"',
  },
  {
    title: 'Consider Total Compensation',
    description: 'Negotiate beyond base salary: equity, signing bonus, PTO, remote work, title.',
  },
  {
    title: 'Use Silence',
    description: 'After receiving an offer, pause before responding. Silence can prompt better offers.',
  },
  {
    title: 'Get It In Writing',
    description: 'Always get the final offer in writing before accepting.',
  },
]

const counterOfferScripts = [
  {
    scenario: 'Initial Offer Below Range',
    script: '"Thank you for the offer. I\'m very excited about this opportunity. Based on my research and experience, I was expecting something in the range of $X-$Y. Is there flexibility in the base salary?"',
  },
  {
    scenario: 'Competing Offer',
    script: '"I\'ve received another offer at $X. I\'d prefer to work with your company because [reason]. Is there room to match or come closer to that figure?"',
  },
  {
    scenario: 'Asking for More Equity',
    script: '"I understand the base salary constraints. Would it be possible to increase the equity component to bridge the gap? I\'m committed to the long-term success of the company."',
  },
  {
    scenario: 'Requesting Signing Bonus',
    script: '"If the base salary is firm, would a signing bonus be possible? This would help offset [reason: relocation, leaving unvested equity, etc.]."',
  },
]

export default function SalaryNegotiationPage() {
  const [jobTitle, setJobTitle] = useState('')
  const [experience, setExperience] = useState('')
  const [location, setLocation] = useState('')
  const [currentSalary, setCurrentSalary] = useState('')
  const [isCalculating, setIsCalculating] = useState(false)
  const [salaryData, setSalaryData] = useState<SalaryData | null>(null)
  const [copiedScript, setCopiedScript] = useState<number | null>(null)
  const [marketDemand, setMarketDemand] = useState<'low' | 'medium' | 'high' | 'very_high'>('medium')

  const calculateSalary = async () => {
    if (!jobTitle || !experience || !location) return

    setIsCalculating(true)
    await new Promise(resolve => setTimeout(resolve, 1500))

    const normalizedTitle = jobTitle.toLowerCase()
    const baseSalary = baseSalaries[normalizedTitle] || baseSalaries['default']
    const base = baseSalary[experience] || baseSalary['mid']
    const locationData = locations.find(l => l.value === location)
    const multiplier = locationData?.multiplier || 1

    const median = Math.round(base * multiplier)
    const min = Math.round(median * 0.8)
    const max = Math.round(median * 1.25)
    const percentile25 = Math.round(median * 0.9)
    const percentile75 = Math.round(median * 1.15)

    setSalaryData({ min, max, median, percentile25, percentile75 })

    // Simulate market demand based on job title
    const highDemandRoles = ['software engineer', 'data scientist', 'product manager']
    if (highDemandRoles.some(r => normalizedTitle.includes(r))) {
      setMarketDemand('high')
    } else {
      setMarketDemand('medium')
    }

    setIsCalculating(false)
  }

  const copyScript = (index: number, script: string) => {
    navigator.clipboard.writeText(script)
    setCopiedScript(index)
    setTimeout(() => setCopiedScript(null), 2000)
  }

  const formatSalary = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const getMarketDemandColor = () => {
    switch (marketDemand) {
      case 'very_high': return 'bg-emerald-100 text-emerald-700'
      case 'high': return 'bg-teal-100 text-teal-700'
      case 'medium': return 'bg-amber-100 text-amber-700'
      case 'low': return 'bg-red-100 text-red-700'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 flex items-center justify-center">
              <DollarSign className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-800">Salary Negotiation Assistant</h1>
              <p className="text-slate-500">Get market data and negotiation scripts</p>
            </div>
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Input Section */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-emerald-500" />
                  Your Details
                </CardTitle>
                <CardDescription>
                  Enter your information to get personalized salary insights
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="jobTitle">Job Title</Label>
                  <Input
                    id="jobTitle"
                    value={jobTitle}
                    onChange={(e) => setJobTitle(e.target.value)}
                    placeholder="e.g., Software Engineer, Product Manager"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Experience Level</Label>
                  <Select value={experience} onValueChange={setExperience}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select experience level" />
                    </SelectTrigger>
                    <SelectContent>
                      {experienceLevels.map(level => (
                        <SelectItem key={level.value} value={level.value}>
                          {level.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Location</Label>
                  <Select value={location} onValueChange={setLocation}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select location" />
                    </SelectTrigger>
                    <SelectContent>
                      {locations.map(loc => (
                        <SelectItem key={loc.value} value={loc.value}>
                          {loc.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="currentSalary">Current Salary (Optional)</Label>
                  <Input
                    id="currentSalary"
                    type="number"
                    value={currentSalary}
                    onChange={(e) => setCurrentSalary(e.target.value)}
                    placeholder="e.g., 100000"
                  />
                </div>

                <Button
                  onClick={calculateSalary}
                  disabled={!jobTitle || !experience || !location || isCalculating}
                  className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600"
                >
                  {isCalculating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Calculating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-4 w-4" />
                      Get Salary Insights
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Negotiation Tips */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lightbulb className="h-5 w-5 text-amber-500" />
                  Negotiation Tips
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {negotiationTips.map((tip, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="p-3 bg-slate-50 rounded-lg"
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <span className="text-xs font-bold text-emerald-600">{index + 1}</span>
                        </div>
                        <div>
                          <h4 className="font-medium text-slate-800">{tip.title}</h4>
                          <p className="text-sm text-slate-600 mt-1">{tip.description}</p>
                          {tip.script && (
                            <div className="mt-2 p-2 bg-white rounded border border-slate-200 text-sm italic text-slate-600">
                              {tip.script}
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Results Section */}
          <div className="space-y-6">
            {salaryData ? (
              <>
                {/* Salary Range Card */}
                <Card className="overflow-hidden">
                  <div className="bg-gradient-to-r from-emerald-500 to-teal-500 p-6 text-white">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-semibold">Estimated Salary Range</h3>
                        <p className="text-emerald-100 text-sm">{jobTitle} • {experienceLevels.find(e => e.value === experience)?.label}</p>
                      </div>
                      <Badge className={getMarketDemandColor()}>
                        <TrendingUp className="h-3 w-3 mr-1" />
                        {marketDemand.replace('_', ' ')} demand
                      </Badge>
                    </div>
                    <div className="text-center">
                      <div className="text-4xl font-bold mb-1">
                        {formatSalary(salaryData.percentile25)} - {formatSalary(salaryData.percentile75)}
                      </div>
                      <div className="text-emerald-100">Typical Range (25th-75th percentile)</div>
                    </div>
                  </div>
                  <CardContent className="p-6">
                    {/* Salary Distribution */}
                    <div className="mb-6">
                      <div className="flex justify-between text-sm text-slate-500 mb-2">
                        <span>{formatSalary(salaryData.min)}</span>
                        <span className="font-medium text-emerald-600">Median: {formatSalary(salaryData.median)}</span>
                        <span>{formatSalary(salaryData.max)}</span>
                      </div>
                      <div className="relative h-4 bg-slate-100 rounded-full overflow-hidden">
                        <div 
                          className="absolute h-full bg-gradient-to-r from-emerald-200 to-emerald-400"
                          style={{ 
                            left: `${((salaryData.percentile25 - salaryData.min) / (salaryData.max - salaryData.min)) * 100}%`,
                            width: `${((salaryData.percentile75 - salaryData.percentile25) / (salaryData.max - salaryData.min)) * 100}%`
                          }}
                        />
                        <div 
                          className="absolute w-1 h-full bg-emerald-600"
                          style={{ left: `${((salaryData.median - salaryData.min) / (salaryData.max - salaryData.min)) * 100}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-xs text-slate-400 mt-1">
                        <span>Min</span>
                        <span>Max</span>
                      </div>
                    </div>

                    {/* Key Stats */}
                    <div className="grid grid-cols-3 gap-4">
                      <div className="text-center p-3 bg-slate-50 rounded-lg">
                        <BarChart3 className="h-5 w-5 text-slate-400 mx-auto mb-1" />
                        <div className="text-lg font-bold text-slate-800">{formatSalary(salaryData.median)}</div>
                        <div className="text-xs text-slate-500">Median</div>
                      </div>
                      <div className="text-center p-3 bg-emerald-50 rounded-lg">
                        <Target className="h-5 w-5 text-emerald-500 mx-auto mb-1" />
                        <div className="text-lg font-bold text-emerald-600">{formatSalary(salaryData.percentile75)}</div>
                        <div className="text-xs text-slate-500">Target (75th)</div>
                      </div>
                      <div className="text-center p-3 bg-teal-50 rounded-lg">
                        <Zap className="h-5 w-5 text-teal-500 mx-auto mb-1" />
                        <div className="text-lg font-bold text-teal-600">{formatSalary(salaryData.max)}</div>
                        <div className="text-xs text-slate-500">Top Earners</div>
                      </div>
                    </div>

                    {/* Current Salary Comparison */}
                    {currentSalary && (
                      <div className="mt-4 p-4 bg-amber-50 rounded-lg border border-amber-100">
                        <div className="flex items-center gap-2 mb-2">
                          <TrendingUp className="h-4 w-4 text-amber-500" />
                          <span className="font-medium text-amber-800">Your Position</span>
                        </div>
                        <p className="text-sm text-amber-700">
                          Your current salary of {formatSalary(parseInt(currentSalary))} is{' '}
                          {parseInt(currentSalary) < salaryData.percentile25 ? (
                            <span className="font-semibold">below market rate. You could negotiate for {formatSalary(salaryData.median - parseInt(currentSalary))} more.</span>
                          ) : parseInt(currentSalary) > salaryData.percentile75 ? (
                            <span className="font-semibold">above average for this role. Great job!</span>
                          ) : (
                            <span className="font-semibold">within the typical range.</span>
                          )}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Counter Offer Scripts */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Sparkles className="h-5 w-5 text-violet-500" />
                      Counter Offer Scripts
                    </CardTitle>
                    <CardDescription>
                      Copy and customize these scripts for your negotiation
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {counterOfferScripts.map((item, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="p-4 bg-slate-50 rounded-lg"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <Badge variant="outline">{item.scenario}</Badge>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => copyScript(index, item.script)}
                            >
                              {copiedScript === index ? (
                                <CheckCircle className="h-4 w-4 text-emerald-500" />
                              ) : (
                                <Copy className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                          <p className="text-sm text-slate-600 italic">&ldquo;{item.script}&rdquo;</p>
                        </motion.div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </>
            ) : (
              <Card className="h-full flex items-center justify-center">
                <CardContent className="text-center py-16">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-r from-emerald-100 to-teal-100 flex items-center justify-center">
                    <DollarSign className="h-8 w-8 text-emerald-500" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-800 mb-2">Ready to Calculate</h3>
                  <p className="text-slate-500 mb-4">
                    Enter your details to get salary insights and negotiation tips
                  </p>
                  <div className="flex items-center justify-center gap-2 text-sm text-emerald-600">
                    <ArrowRight className="h-4 w-4" />
                    <span>Get market-based salary data</span>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
