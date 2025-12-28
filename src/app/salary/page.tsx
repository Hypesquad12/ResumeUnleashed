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
  BarChart3, Users, Building2, Loader2, Zap, Globe
} from 'lucide-react'
import { metroCities, getRegions, getCitiesByRegion, getCityByValue } from '@/lib/data/metro-cities'
import { toast } from 'sonner'

interface SalaryData {
  min: number
  max: number
  median: number
  percentile25: number
  percentile75: number
  currency?: string
}

interface NegotiationTip {
  title: string
  description: string
  script?: string
}

interface AIResponse {
  salaryRange: SalaryData
  marketDemand: 'low' | 'medium' | 'high' | 'very_high'
  demandReason: string
  keyFactors: string[]
  negotiationTips: NegotiationTip[]
  totalCompensation: {
    equityRange: string
    bonusRange: string
    benefits: string[]
  }
  marketInsights: string
  comparisonToCurrentSalary?: string
}

const experienceLevels = [
  { value: 'entry', label: 'Entry Level (0-2 years)' },
  { value: 'mid', label: 'Mid Level (3-5 years)' },
  { value: 'senior', label: 'Senior (6-10 years)' },
  { value: 'lead', label: 'Lead/Staff (10+ years)' },
  { value: 'executive', label: 'Executive/Director' },
]


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
  const [aiResponse, setAiResponse] = useState<AIResponse | null>(null)
  const [selectedRegion, setSelectedRegion] = useState<string>('')
  const [filteredCities, setFilteredCities] = useState(metroCities)
  const [citySearch, setCitySearch] = useState('')

  const calculateSalary = async () => {
    if (!jobTitle || !experience || !location) return

    setIsCalculating(true)
    
    try {
      const cityData = getCityByValue(location)
      const locationMultiplier = cityData?.multiplier || 1
      const locationLabel = cityData?.label || location

      const response = await fetch('/api/estimate-salary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jobTitle,
          experience,
          location: locationLabel,
          locationMultiplier,
          currentSalary,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to get salary estimate')
      }

      const result = await response.json()
      
      if (result.success && result.data) {
        const data = result.data
        setAiResponse(data)
        setSalaryData(data.salaryRange)
        setMarketDemand(data.marketDemand)
        toast.success('AI-powered salary estimate generated!')
      } else {
        throw new Error(result.error || 'Failed to generate estimate')
      }
    } catch (error) {
      console.error('Salary calculation error:', error)
      toast.error('Failed to calculate salary. Please try again.')
    } finally {
      setIsCalculating(false)
    }
  }

  const handleRegionChange = (region: string) => {
    setSelectedRegion(region)
    if (region) {
      setFilteredCities(getCitiesByRegion(region))
    } else {
      setFilteredCities(metroCities)
    }
    setLocation('') // Reset location when region changes
    setCitySearch('') // Reset search
  }

  const displayedCities = citySearch
    ? filteredCities.filter(city => 
        city.label.toLowerCase().includes(citySearch.toLowerCase()) ||
        city.country.toLowerCase().includes(citySearch.toLowerCase())
      )
    : filteredCities

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

        {/* Two Column Layout: Your Details + Negotiation Tips */}
        <div className="grid lg:grid-cols-2 gap-6 mb-6">
          {/* Input Section */}
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
                <Label className="flex items-center gap-2">
                  <Globe className="h-4 w-4 text-emerald-500" />
                  Region (Optional - filter cities)
                </Label>
                <Select value={selectedRegion} onValueChange={handleRegionChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="All regions" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Regions</SelectItem>
                    {getRegions().map(region => (
                      <SelectItem key={region} value={region}>
                        {region}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-emerald-500" />
                  Location *
                </Label>
                <div className="space-y-2">
                  <Input
                    placeholder="Search cities..."
                    value={citySearch}
                    onChange={(e) => setCitySearch(e.target.value)}
                    className="w-full"
                  />
                  <Select value={location || undefined} onValueChange={setLocation}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select city" />
                    </SelectTrigger>
                    <SelectContent className="max-h-[300px]">
                      {displayedCities.length > 0 ? (
                        displayedCities.slice(0, 50).map(city => (
                          <SelectItem key={city.value} value={city.value}>
                            {city.label} ({city.country})
                          </SelectItem>
                        ))
                      ) : (
                        <div className="p-2 text-sm text-slate-500 text-center">
                          No cities found
                        </div>
                      )}
                      {displayedCities.length > 50 && (
                        <div className="p-2 text-xs text-slate-500 text-center border-t">
                          Showing 50 of {displayedCities.length} cities. Use search to narrow down.
                        </div>
                      )}
                    </SelectContent>
                  </Select>
                </div>
                {selectedRegion && (
                  <p className="text-xs text-slate-500">
                    {filteredCities.length} cities in {selectedRegion}
                  </p>
                )}
                {citySearch && (
                  <p className="text-xs text-slate-500">
                    Found {displayedCities.length} matching cities
                  </p>
                )}
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

          {/* Negotiation Tips - Now side by side */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5 text-amber-500" />
                Negotiation Tips
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
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

        {/* Results Section - Full Width Below */}
        {salaryData && (
          <>
          <div className="grid lg:grid-cols-2 gap-6">
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
          </div>

          {/* AI-Generated Insights */}
          {aiResponse && (
            <div className="grid lg:grid-cols-2 gap-6 mt-6">
              {/* Key Factors */}
              {aiResponse.keyFactors && aiResponse.keyFactors.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="h-5 w-5 text-blue-500" />
                      Key Factors Affecting Salary
                    </CardTitle>
                    <CardDescription>
                      {aiResponse.demandReason}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {aiResponse.keyFactors.map((factor, index) => (
                        <li key={index} className="flex items-start gap-2 text-sm">
                          <CheckCircle className="h-4 w-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                          <span>{factor}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}

              {/* Total Compensation */}
              {aiResponse.totalCompensation && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <DollarSign className="h-5 w-5 text-violet-500" />
                      Total Compensation Package
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="p-3 bg-violet-50 rounded-lg">
                      <div className="text-xs text-violet-600 font-medium mb-1">Equity</div>
                      <div className="text-sm text-slate-700">{aiResponse.totalCompensation.equityRange}</div>
                    </div>
                    <div className="p-3 bg-blue-50 rounded-lg">
                      <div className="text-xs text-blue-600 font-medium mb-1">Bonus</div>
                      <div className="text-sm text-slate-700">{aiResponse.totalCompensation.bonusRange}</div>
                    </div>
                    {aiResponse.totalCompensation.benefits && aiResponse.totalCompensation.benefits.length > 0 && (
                      <div className="p-3 bg-emerald-50 rounded-lg">
                        <div className="text-xs text-emerald-600 font-medium mb-2">Typical Benefits</div>
                        <div className="flex flex-wrap gap-1">
                          {aiResponse.totalCompensation.benefits.map((benefit, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {benefit}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Market Insights */}
              {aiResponse.marketInsights && (
                <Card className="lg:col-span-2">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-amber-500" />
                      Market Insights & Trends
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-slate-700 leading-relaxed">{aiResponse.marketInsights}</p>
                    {aiResponse.comparisonToCurrentSalary && (
                      <div className="mt-4 p-4 bg-amber-50 rounded-lg border border-amber-200">
                        <p className="text-sm text-amber-800">{aiResponse.comparisonToCurrentSalary}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* AI-Generated Negotiation Tips */}
              {aiResponse.negotiationTips && aiResponse.negotiationTips.length > 0 && (
                <Card className="lg:col-span-2">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Sparkles className="h-5 w-5 text-violet-500" />
                      AI-Powered Negotiation Strategies
                    </CardTitle>
                    <CardDescription>
                      Personalized tips based on your role and market conditions
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-2 gap-4">
                      {aiResponse.negotiationTips.map((tip, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="p-4 bg-gradient-to-br from-violet-50 to-purple-50 rounded-lg border border-violet-200"
                        >
                          <div className="flex items-start gap-3">
                            <div className="w-6 h-6 rounded-full bg-violet-500 flex items-center justify-center flex-shrink-0">
                              <span className="text-xs font-bold text-white">{index + 1}</span>
                            </div>
                            <div className="flex-1">
                              <h4 className="font-semibold text-slate-800 mb-1">{tip.title}</h4>
                              <p className="text-sm text-slate-600 mb-2">{tip.description}</p>
                              {tip.script && (
                                <div className="mt-2 p-3 bg-white rounded border border-violet-200">
                                  <div className="flex items-center justify-between mb-1">
                                    <span className="text-xs font-medium text-violet-600">Script:</span>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => copyScript(1000 + index, tip.script!)}
                                      className="h-6 px-2"
                                    >
                                      {copiedScript === 1000 + index ? (
                                        <CheckCircle className="h-3 w-3 text-emerald-500" />
                                      ) : (
                                        <Copy className="h-3 w-3" />
                                      )}
                                    </Button>
                                  </div>
                                  <p className="text-xs text-slate-600 italic">&ldquo;{tip.script}&rdquo;</p>
                                </div>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
          </>
        )}
      </div>
    </div>
  )
}
