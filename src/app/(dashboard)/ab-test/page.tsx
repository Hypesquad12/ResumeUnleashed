'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { 
  Plus, FlaskConical, Eye, Download, Clock, Trophy, 
  BarChart3, Link2, Copy, CheckCircle, Pause, Play,
  TrendingUp, ArrowRight, Sparkles, Target, Zap
} from 'lucide-react'

interface ABTest {
  id: string
  name: string
  resume_a: { id: string; name: string }
  resume_b: { id: string; name: string }
  link_a: string
  link_b: string
  views_a: number
  views_b: number
  downloads_a: number
  downloads_b: number
  avg_time_a: number
  avg_time_b: number
  status: 'active' | 'paused' | 'completed'
  winner?: 'a' | 'b' | 'tie'
  created_at: string
  ends_at?: string
}

const sampleTests: ABTest[] = [
  {
    id: '1',
    name: 'Modern vs Classic Template',
    resume_a: { id: 'r1', name: 'Modern Resume' },
    resume_b: { id: 'r2', name: 'Classic Resume' },
    link_a: 'https://resume.app/r/abc123-a',
    link_b: 'https://resume.app/r/abc123-b',
    views_a: 145,
    views_b: 132,
    downloads_a: 23,
    downloads_b: 18,
    avg_time_a: 45,
    avg_time_b: 38,
    status: 'active',
    created_at: '2024-01-10',
  },
  {
    id: '2',
    name: 'Summary Length Test',
    resume_a: { id: 'r3', name: 'Short Summary' },
    resume_b: { id: 'r4', name: 'Detailed Summary' },
    link_a: 'https://resume.app/r/def456-a',
    link_b: 'https://resume.app/r/def456-b',
    views_a: 89,
    views_b: 112,
    downloads_a: 12,
    downloads_b: 28,
    avg_time_a: 32,
    avg_time_b: 52,
    status: 'completed',
    winner: 'b',
    created_at: '2024-01-05',
    ends_at: '2024-01-15',
  },
]

const sampleResumes = [
  { id: 'r1', name: 'Modern Resume' },
  { id: 'r2', name: 'Classic Resume' },
  { id: 'r3', name: 'Short Summary' },
  { id: 'r4', name: 'Detailed Summary' },
  { id: 'r5', name: 'Tech Focus Resume' },
  { id: 'r6', name: 'Leadership Focus Resume' },
]

export default function ABTestPage() {
  const [tests, setTests] = useState<ABTest[]>(sampleTests)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [copiedLink, setCopiedLink] = useState<string | null>(null)
  
  const [formData, setFormData] = useState({
    name: '',
    resume_a_id: '',
    resume_b_id: '',
  })

  const copyToClipboard = (link: string, id: string) => {
    navigator.clipboard.writeText(link)
    setCopiedLink(id)
    setTimeout(() => setCopiedLink(null), 2000)
  }

  const createTest = () => {
    if (!formData.name || !formData.resume_a_id || !formData.resume_b_id) return

    const resumeA = sampleResumes.find(r => r.id === formData.resume_a_id)
    const resumeB = sampleResumes.find(r => r.id === formData.resume_b_id)

    const newTest: ABTest = {
      id: Date.now().toString(),
      name: formData.name,
      resume_a: resumeA!,
      resume_b: resumeB!,
      link_a: `https://resume.app/r/${Date.now()}-a`,
      link_b: `https://resume.app/r/${Date.now()}-b`,
      views_a: 0,
      views_b: 0,
      downloads_a: 0,
      downloads_b: 0,
      avg_time_a: 0,
      avg_time_b: 0,
      status: 'active',
      created_at: new Date().toISOString(),
    }

    setTests([newTest, ...tests])
    setIsCreateDialogOpen(false)
    setFormData({ name: '', resume_a_id: '', resume_b_id: '' })
  }

  const toggleTestStatus = (id: string) => {
    setTests(tests.map(test => 
      test.id === id 
        ? { ...test, status: test.status === 'active' ? 'paused' : 'active' }
        : test
    ))
  }

  const endTest = (id: string) => {
    setTests(tests.map(test => {
      if (test.id !== id) return test
      
      const totalA = test.views_a + test.downloads_a * 2
      const totalB = test.views_b + test.downloads_b * 2
      let winner: 'a' | 'b' | 'tie' = 'tie'
      if (totalA > totalB * 1.1) winner = 'a'
      else if (totalB > totalA * 1.1) winner = 'b'

      return {
        ...test,
        status: 'completed',
        winner,
        ends_at: new Date().toISOString(),
      }
    }))
  }

  const getWinnerBadge = (test: ABTest, variant: 'a' | 'b') => {
    if (test.status !== 'completed' || !test.winner) return null
    if (test.winner === variant) {
      return (
        <Badge className="bg-emerald-100 text-emerald-700 ml-2">
          <Trophy className="h-3 w-3 mr-1" />
          Winner
        </Badge>
      )
    }
    return null
  }

  const calculateConversionRate = (views: number, downloads: number) => {
    if (views === 0) return 0
    return Math.round((downloads / views) * 100)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-violet-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-violet-500 to-purple-500 flex items-center justify-center">
                <FlaskConical className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-800">Resume A/B Testing</h1>
                <p className="text-slate-500">Compare resume versions and find what works best</p>
              </div>
            </div>
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-violet-500 to-purple-500 hover:from-violet-600 hover:to-purple-600">
                  <Plus className="mr-2 h-4 w-4" />
                  New A/B Test
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create A/B Test</DialogTitle>
                  <DialogDescription>
                    Compare two resume versions to see which performs better
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="testName">Test Name</Label>
                    <Input
                      id="testName"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g., Modern vs Classic Template"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Resume A</Label>
                      <Select
                        value={formData.resume_a_id}
                        onValueChange={(value) => setFormData({ ...formData, resume_a_id: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select resume" />
                        </SelectTrigger>
                        <SelectContent>
                          {sampleResumes.filter(r => r.id !== formData.resume_b_id).map(resume => (
                            <SelectItem key={resume.id} value={resume.id}>
                              {resume.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Resume B</Label>
                      <Select
                        value={formData.resume_b_id}
                        onValueChange={(value) => setFormData({ ...formData, resume_b_id: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select resume" />
                        </SelectTrigger>
                        <SelectContent>
                          {sampleResumes.filter(r => r.id !== formData.resume_a_id).map(resume => (
                            <SelectItem key={resume.id} value={resume.id}>
                              {resume.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="bg-violet-50 rounded-lg p-4 text-sm text-violet-700">
                    <Sparkles className="h-4 w-4 inline mr-2" />
                    Share both links with recruiters to see which resume gets more engagement
                  </div>
                  <Button onClick={createTest} className="w-full bg-gradient-to-r from-violet-500 to-purple-500">
                    Create Test
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </motion.div>

        {/* How it works */}
        <Card className="mb-8 bg-gradient-to-r from-violet-50 to-purple-50 border-violet-100">
          <CardContent className="p-6">
            <h3 className="font-semibold text-violet-800 mb-4">How A/B Testing Works</h3>
            <div className="grid md:grid-cols-4 gap-4">
              {[
                { icon: FlaskConical, title: 'Create Test', desc: 'Select two resume versions to compare' },
                { icon: Link2, title: 'Share Links', desc: 'Get unique links for each version' },
                { icon: BarChart3, title: 'Track Metrics', desc: 'Monitor views, downloads & time spent' },
                { icon: Trophy, title: 'Find Winner', desc: 'See which resume performs better' },
              ].map((step, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-violet-100 flex items-center justify-center flex-shrink-0">
                    <step.icon className="h-4 w-4 text-violet-600" />
                  </div>
                  <div>
                    <div className="font-medium text-violet-800 text-sm">{step.title}</div>
                    <div className="text-xs text-violet-600">{step.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Tests List */}
        <div className="space-y-6">
          <AnimatePresence>
            {tests.map((test, index) => (
              <motion.div
                key={test.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -100 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className={test.status === 'completed' ? 'border-emerald-200 bg-emerald-50/30' : ''}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <CardTitle className="text-lg">{test.name}</CardTitle>
                        <Badge className={
                          test.status === 'active' ? 'bg-emerald-100 text-emerald-700' :
                          test.status === 'paused' ? 'bg-amber-100 text-amber-700' :
                          'bg-slate-100 text-slate-700'
                        }>
                          {test.status === 'active' && <Play className="h-3 w-3 mr-1" />}
                          {test.status === 'paused' && <Pause className="h-3 w-3 mr-1" />}
                          {test.status === 'completed' && <CheckCircle className="h-3 w-3 mr-1" />}
                          {test.status.charAt(0).toUpperCase() + test.status.slice(1)}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        {test.status !== 'completed' && (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => toggleTestStatus(test.id)}
                            >
                              {test.status === 'active' ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => endTest(test.id)}
                            >
                              End Test
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                    <CardDescription>
                      Started {new Date(test.created_at).toLocaleDateString()}
                      {test.ends_at && ` • Ended ${new Date(test.ends_at).toLocaleDateString()}`}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-2 gap-6">
                      {/* Version A */}
                      <div className={`p-4 rounded-xl border-2 ${
                        test.winner === 'a' ? 'border-emerald-300 bg-emerald-50' : 'border-slate-200 bg-slate-50'
                      }`}>
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                              Version A
                            </Badge>
                            <span className="font-medium text-slate-700">{test.resume_a.name}</span>
                            {getWinnerBadge(test, 'a')}
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-3 gap-3 mb-4">
                          <div className="text-center p-2 bg-white rounded-lg">
                            <Eye className="h-4 w-4 text-slate-400 mx-auto mb-1" />
                            <div className="text-xl font-bold text-slate-800">{test.views_a}</div>
                            <div className="text-xs text-slate-500">Views</div>
                          </div>
                          <div className="text-center p-2 bg-white rounded-lg">
                            <Download className="h-4 w-4 text-slate-400 mx-auto mb-1" />
                            <div className="text-xl font-bold text-slate-800">{test.downloads_a}</div>
                            <div className="text-xs text-slate-500">Downloads</div>
                          </div>
                          <div className="text-center p-2 bg-white rounded-lg">
                            <Clock className="h-4 w-4 text-slate-400 mx-auto mb-1" />
                            <div className="text-xl font-bold text-slate-800">{test.avg_time_a}s</div>
                            <div className="text-xs text-slate-500">Avg. Time</div>
                          </div>
                        </div>

                        <div className="mb-3">
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-slate-600">Conversion Rate</span>
                            <span className="font-medium">{calculateConversionRate(test.views_a, test.downloads_a)}%</span>
                          </div>
                          <Progress value={calculateConversionRate(test.views_a, test.downloads_a)} className="h-2" />
                        </div>

                        <div className="flex items-center gap-2">
                          <Input
                            value={test.link_a}
                            readOnly
                            className="text-xs bg-white"
                          />
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => copyToClipboard(test.link_a, `${test.id}-a`)}
                          >
                            {copiedLink === `${test.id}-a` ? (
                              <CheckCircle className="h-4 w-4 text-emerald-500" />
                            ) : (
                              <Copy className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </div>

                      {/* Version B */}
                      <div className={`p-4 rounded-xl border-2 ${
                        test.winner === 'b' ? 'border-emerald-300 bg-emerald-50' : 'border-slate-200 bg-slate-50'
                      }`}>
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                              Version B
                            </Badge>
                            <span className="font-medium text-slate-700">{test.resume_b.name}</span>
                            {getWinnerBadge(test, 'b')}
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-3 gap-3 mb-4">
                          <div className="text-center p-2 bg-white rounded-lg">
                            <Eye className="h-4 w-4 text-slate-400 mx-auto mb-1" />
                            <div className="text-xl font-bold text-slate-800">{test.views_b}</div>
                            <div className="text-xs text-slate-500">Views</div>
                          </div>
                          <div className="text-center p-2 bg-white rounded-lg">
                            <Download className="h-4 w-4 text-slate-400 mx-auto mb-1" />
                            <div className="text-xl font-bold text-slate-800">{test.downloads_b}</div>
                            <div className="text-xs text-slate-500">Downloads</div>
                          </div>
                          <div className="text-center p-2 bg-white rounded-lg">
                            <Clock className="h-4 w-4 text-slate-400 mx-auto mb-1" />
                            <div className="text-xl font-bold text-slate-800">{test.avg_time_b}s</div>
                            <div className="text-xs text-slate-500">Avg. Time</div>
                          </div>
                        </div>

                        <div className="mb-3">
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-slate-600">Conversion Rate</span>
                            <span className="font-medium">{calculateConversionRate(test.views_b, test.downloads_b)}%</span>
                          </div>
                          <Progress value={calculateConversionRate(test.views_b, test.downloads_b)} className="h-2" />
                        </div>

                        <div className="flex items-center gap-2">
                          <Input
                            value={test.link_b}
                            readOnly
                            className="text-xs bg-white"
                          />
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => copyToClipboard(test.link_b, `${test.id}-b`)}
                          >
                            {copiedLink === `${test.id}-b` ? (
                              <CheckCircle className="h-4 w-4 text-emerald-500" />
                            ) : (
                              <Copy className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </div>
                    </div>

                    {/* Winner Summary */}
                    {test.status === 'completed' && test.winner && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-4 p-4 bg-emerald-50 rounded-xl border border-emerald-200"
                      >
                        <div className="flex items-center gap-3">
                          <Trophy className="h-6 w-6 text-emerald-500" />
                          <div>
                            <div className="font-semibold text-emerald-800">
                              {test.winner === 'tie' 
                                ? 'It\'s a tie! Both versions performed similarly.'
                                : `Version ${test.winner.toUpperCase()} wins!`
                              }
                            </div>
                            {test.winner !== 'tie' && (
                              <div className="text-sm text-emerald-600">
                                {test.winner === 'a' ? test.resume_a.name : test.resume_b.name} had better engagement
                              </div>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>

          {tests.length === 0 && (
            <Card>
              <CardContent className="py-16 text-center">
                <FlaskConical className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-slate-800 mb-2">No A/B Tests Yet</h3>
                <p className="text-slate-500 mb-4">
                  Create your first test to compare resume versions
                </p>
                <Button onClick={() => setIsCreateDialogOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Your First Test
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
