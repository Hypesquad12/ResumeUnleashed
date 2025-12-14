'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
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
  Plus, Briefcase, Building2, MapPin, DollarSign, Calendar,
  ExternalLink, MoreVertical, Trash2, Edit, CheckCircle,
  Clock, XCircle, MessageSquare, TrendingUp, Target, Zap,
  Filter, Search, ArrowUpDown, Bookmark, Send, Users
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface JobApplication {
  id: string
  company_name: string
  job_title: string
  job_url?: string
  job_description?: string
  salary_min?: number
  salary_max?: number
  location?: string
  remote_type?: 'remote' | 'hybrid' | 'onsite'
  status: 'saved' | 'applied' | 'interviewing' | 'offer' | 'rejected' | 'withdrawn'
  applied_at?: string
  response_at?: string
  notes?: string
  next_step?: string
  next_step_date?: string
  created_at: string
}

const statusConfig = {
  saved: { label: 'Saved', color: 'bg-slate-100 text-slate-700', icon: Bookmark },
  applied: { label: 'Applied', color: 'bg-blue-100 text-blue-700', icon: Send },
  interviewing: { label: 'Interviewing', color: 'bg-violet-100 text-violet-700', icon: Users },
  offer: { label: 'Offer', color: 'bg-emerald-100 text-emerald-700', icon: CheckCircle },
  rejected: { label: 'Rejected', color: 'bg-red-100 text-red-700', icon: XCircle },
  withdrawn: { label: 'Withdrawn', color: 'bg-amber-100 text-amber-700', icon: Clock },
}

const sampleApplications: JobApplication[] = [
  {
    id: '1',
    company_name: 'TechCorp Inc',
    job_title: 'Senior Software Engineer',
    job_url: 'https://example.com/job/1',
    location: 'San Francisco, CA',
    remote_type: 'hybrid',
    salary_min: 150000,
    salary_max: 200000,
    status: 'interviewing',
    applied_at: '2024-01-10',
    next_step: 'Technical Interview',
    next_step_date: '2024-01-20',
    created_at: '2024-01-08',
  },
  {
    id: '2',
    company_name: 'StartupXYZ',
    job_title: 'Full Stack Developer',
    location: 'Remote',
    remote_type: 'remote',
    salary_min: 120000,
    salary_max: 160000,
    status: 'applied',
    applied_at: '2024-01-12',
    created_at: '2024-01-12',
  },
  {
    id: '3',
    company_name: 'Enterprise Solutions',
    job_title: 'Tech Lead',
    location: 'New York, NY',
    remote_type: 'onsite',
    salary_min: 180000,
    salary_max: 220000,
    status: 'saved',
    created_at: '2024-01-14',
  },
  {
    id: '4',
    company_name: 'Innovation Labs',
    job_title: 'Frontend Engineer',
    location: 'Austin, TX',
    remote_type: 'hybrid',
    salary_min: 130000,
    salary_max: 170000,
    status: 'offer',
    applied_at: '2024-01-05',
    response_at: '2024-01-15',
    created_at: '2024-01-03',
  },
]

export default function ApplicationsPage() {
  const [applications, setApplications] = useState<JobApplication[]>(sampleApplications)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [editingApp, setEditingApp] = useState<JobApplication | null>(null)
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState<'date' | 'company' | 'status'>('date')

  // Form state
  const [formData, setFormData] = useState({
    company_name: '',
    job_title: '',
    job_url: '',
    job_description: '',
    salary_min: '',
    salary_max: '',
    location: '',
    remote_type: 'onsite' as 'remote' | 'hybrid' | 'onsite',
    status: 'saved' as JobApplication['status'],
    notes: '',
    next_step: '',
    next_step_date: '',
  })

  const resetForm = () => {
    setFormData({
      company_name: '',
      job_title: '',
      job_url: '',
      job_description: '',
      salary_min: '',
      salary_max: '',
      location: '',
      remote_type: 'onsite',
      status: 'saved',
      notes: '',
      next_step: '',
      next_step_date: '',
    })
  }

  const handleSubmit = () => {
    if (!formData.company_name || !formData.job_title) return

    const newApp: JobApplication = {
      id: editingApp?.id || Date.now().toString(),
      company_name: formData.company_name,
      job_title: formData.job_title,
      job_url: formData.job_url || undefined,
      job_description: formData.job_description || undefined,
      salary_min: formData.salary_min ? parseInt(formData.salary_min) : undefined,
      salary_max: formData.salary_max ? parseInt(formData.salary_max) : undefined,
      location: formData.location || undefined,
      remote_type: formData.remote_type,
      status: formData.status,
      notes: formData.notes || undefined,
      next_step: formData.next_step || undefined,
      next_step_date: formData.next_step_date || undefined,
      applied_at: formData.status !== 'saved' ? new Date().toISOString().split('T')[0] : undefined,
      created_at: editingApp?.created_at || new Date().toISOString(),
    }

    if (editingApp) {
      setApplications(applications.map(app => app.id === editingApp.id ? newApp : app))
    } else {
      setApplications([newApp, ...applications])
    }

    setIsAddDialogOpen(false)
    setEditingApp(null)
    resetForm()
  }

  const handleEdit = (app: JobApplication) => {
    setEditingApp(app)
    setFormData({
      company_name: app.company_name,
      job_title: app.job_title,
      job_url: app.job_url || '',
      job_description: app.job_description || '',
      salary_min: app.salary_min?.toString() || '',
      salary_max: app.salary_max?.toString() || '',
      location: app.location || '',
      remote_type: app.remote_type || 'onsite',
      status: app.status,
      notes: app.notes || '',
      next_step: app.next_step || '',
      next_step_date: app.next_step_date || '',
    })
    setIsAddDialogOpen(true)
  }

  const handleDelete = (id: string) => {
    setApplications(applications.filter(app => app.id !== id))
  }

  const updateStatus = (id: string, status: JobApplication['status']) => {
    setApplications(applications.map(app => 
      app.id === id ? { ...app, status, applied_at: status !== 'saved' ? app.applied_at || new Date().toISOString().split('T')[0] : app.applied_at } : app
    ))
  }

  // Filter and sort applications
  const filteredApps = applications
    .filter(app => filterStatus === 'all' || app.status === filterStatus)
    .filter(app => 
      app.company_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.job_title.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === 'date') return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      if (sortBy === 'company') return a.company_name.localeCompare(b.company_name)
      return 0
    })

  // Stats
  const stats = {
    total: applications.length,
    applied: applications.filter(a => a.status === 'applied').length,
    interviewing: applications.filter(a => a.status === 'interviewing').length,
    offers: applications.filter(a => a.status === 'offer').length,
    responseRate: applications.length > 0 
      ? Math.round((applications.filter(a => ['interviewing', 'offer'].includes(a.status)).length / applications.filter(a => a.status !== 'saved').length) * 100) || 0
      : 0,
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-500 flex items-center justify-center">
                <Briefcase className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-800">Job Application Tracker</h1>
                <p className="text-slate-500">Track and manage all your job applications</p>
              </div>
            </div>
            <Dialog open={isAddDialogOpen} onOpenChange={(open) => {
              setIsAddDialogOpen(open)
              if (!open) {
                setEditingApp(null)
                resetForm()
              }
            }}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Application
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>{editingApp ? 'Edit Application' : 'Add New Application'}</DialogTitle>
                  <DialogDescription>
                    {editingApp ? 'Update the job application details' : 'Track a new job application'}
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="company">Company Name *</Label>
                      <Input
                        id="company"
                        value={formData.company_name}
                        onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                        placeholder="e.g., Google"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="title">Job Title *</Label>
                      <Input
                        id="title"
                        value={formData.job_title}
                        onChange={(e) => setFormData({ ...formData, job_title: e.target.value })}
                        placeholder="e.g., Software Engineer"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="url">Job URL</Label>
                    <Input
                      id="url"
                      value={formData.job_url}
                      onChange={(e) => setFormData({ ...formData, job_url: e.target.value })}
                      placeholder="https://..."
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="location">Location</Label>
                      <Input
                        id="location"
                        value={formData.location}
                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                        placeholder="e.g., San Francisco, CA"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Work Type</Label>
                      <Select
                        value={formData.remote_type}
                        onValueChange={(value: 'remote' | 'hybrid' | 'onsite') => setFormData({ ...formData, remote_type: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="remote">Remote</SelectItem>
                          <SelectItem value="hybrid">Hybrid</SelectItem>
                          <SelectItem value="onsite">On-site</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="salaryMin">Salary Min ($)</Label>
                      <Input
                        id="salaryMin"
                        type="number"
                        value={formData.salary_min}
                        onChange={(e) => setFormData({ ...formData, salary_min: e.target.value })}
                        placeholder="e.g., 100000"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="salaryMax">Salary Max ($)</Label>
                      <Input
                        id="salaryMax"
                        type="number"
                        value={formData.salary_max}
                        onChange={(e) => setFormData({ ...formData, salary_max: e.target.value })}
                        placeholder="e.g., 150000"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Status</Label>
                    <Select
                      value={formData.status}
                      onValueChange={(value: JobApplication['status']) => setFormData({ ...formData, status: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(statusConfig).map(([key, config]) => (
                          <SelectItem key={key} value={key}>
                            {config.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="nextStep">Next Step</Label>
                      <Input
                        id="nextStep"
                        value={formData.next_step}
                        onChange={(e) => setFormData({ ...formData, next_step: e.target.value })}
                        placeholder="e.g., Phone Screen"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="nextStepDate">Next Step Date</Label>
                      <Input
                        id="nextStepDate"
                        type="date"
                        value={formData.next_step_date}
                        onChange={(e) => setFormData({ ...formData, next_step_date: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="notes">Notes</Label>
                    <Textarea
                      id="notes"
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      placeholder="Add any notes about this application..."
                      rows={3}
                    />
                  </div>

                  <Button onClick={handleSubmit} className="w-full bg-gradient-to-r from-blue-500 to-indigo-500">
                    {editingApp ? 'Update Application' : 'Add Application'}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          {[
            { label: 'Total', value: stats.total, icon: Briefcase, color: 'from-slate-500 to-slate-600' },
            { label: 'Applied', value: stats.applied, icon: Send, color: 'from-blue-500 to-blue-600' },
            { label: 'Interviewing', value: stats.interviewing, icon: Users, color: 'from-violet-500 to-violet-600' },
            { label: 'Offers', value: stats.offers, icon: CheckCircle, color: 'from-emerald-500 to-emerald-600' },
            { label: 'Response Rate', value: `${stats.responseRate}%`, icon: TrendingUp, color: 'from-amber-500 to-amber-600' },
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg bg-gradient-to-r ${stat.color} flex items-center justify-center`}>
                      <stat.icon className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-slate-800">{stat.value}</div>
                      <div className="text-xs text-slate-500">{stat.label}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex-1 min-w-[200px]">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    placeholder="Search by company or job title..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-[150px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Filter" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  {Object.entries(statusConfig).map(([key, config]) => (
                    <SelectItem key={key} value={key}>{config.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={sortBy} onValueChange={(v: 'date' | 'company' | 'status') => setSortBy(v)}>
                <SelectTrigger className="w-[150px]">
                  <ArrowUpDown className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Sort" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="date">Date Added</SelectItem>
                  <SelectItem value="company">Company</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Applications List */}
        <div className="space-y-4">
          <AnimatePresence>
            {filteredApps.map((app, index) => {
              const StatusIcon = statusConfig[app.status].icon
              return (
                <motion.div
                  key={app.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-4 flex-1">
                          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center text-xl font-bold text-slate-600">
                            {app.company_name.charAt(0)}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-semibold text-slate-800">{app.job_title}</h3>
                              <Badge className={statusConfig[app.status].color}>
                                <StatusIcon className="h-3 w-3 mr-1" />
                                {statusConfig[app.status].label}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-4 text-sm text-slate-500">
                              <span className="flex items-center gap-1">
                                <Building2 className="h-4 w-4" />
                                {app.company_name}
                              </span>
                              {app.location && (
                                <span className="flex items-center gap-1">
                                  <MapPin className="h-4 w-4" />
                                  {app.location}
                                </span>
                              )}
                              {app.salary_min && app.salary_max && (
                                <span className="flex items-center gap-1">
                                  <DollarSign className="h-4 w-4" />
                                  ${(app.salary_min / 1000).toFixed(0)}k - ${(app.salary_max / 1000).toFixed(0)}k
                                </span>
                              )}
                              {app.remote_type && (
                                <Badge variant="outline" className="text-xs">
                                  {app.remote_type}
                                </Badge>
                              )}
                            </div>
                            {app.next_step && (
                              <div className="mt-2 flex items-center gap-2 text-sm">
                                <Calendar className="h-4 w-4 text-violet-500" />
                                <span className="text-violet-600 font-medium">
                                  Next: {app.next_step}
                                  {app.next_step_date && ` on ${new Date(app.next_step_date).toLocaleDateString()}`}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {app.job_url && (
                            <Button variant="ghost" size="icon" asChild>
                              <a href={app.job_url} target="_blank" rel="noopener noreferrer">
                                <ExternalLink className="h-4 w-4" />
                              </a>
                            </Button>
                          )}
                          <Button variant="ghost" size="icon" onClick={() => handleEdit(app)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDelete(app.id)}>
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </div>

                      {/* Quick Status Update */}
                      <div className="mt-4 pt-4 border-t flex items-center gap-2">
                        <span className="text-xs text-slate-500 mr-2">Quick update:</span>
                        {Object.entries(statusConfig).map(([key, config]) => (
                          <Button
                            key={key}
                            variant={app.status === key ? 'default' : 'outline'}
                            size="sm"
                            className={`text-xs ${app.status === key ? '' : 'hover:bg-slate-100'}`}
                            onClick={() => updateStatus(app.id, key as JobApplication['status'])}
                          >
                            {config.label}
                          </Button>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )
            })}
          </AnimatePresence>

          {filteredApps.length === 0 && (
            <Card>
              <CardContent className="py-16 text-center">
                <Briefcase className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-slate-800 mb-2">No applications found</h3>
                <p className="text-slate-500 mb-4">
                  {searchQuery || filterStatus !== 'all' 
                    ? 'Try adjusting your filters'
                    : 'Start tracking your job applications'}
                </p>
                <Button onClick={() => setIsAddDialogOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Your First Application
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
