'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { FileText, Plus, MoreVertical, Download, Trash2, Edit, Eye, Loader2, Sparkles, Clock, ChevronRight, Star, Search, Mail, Copy } from 'lucide-react'
import Link from 'next/link'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'

interface Resume {
  id: string
  title: string
  updated_at: string | null
  created_at: string | null
  is_primary: boolean | null
  skills: string[] | null
}

interface CustomizedResume {
  id: string
  title: string
  created_at: string | null
  match_score: number | null
  source_resume_id: string | null
  cover_letter: string | null
}

interface ResumesClientProps {
  initialResumes: Resume[]
  initialCustomizedResumes: CustomizedResume[]
}

export function ResumesClient({ initialResumes, initialCustomizedResumes }: ResumesClientProps) {
  const router = useRouter()
  const [resumes, setResumes] = useState<Resume[]>(initialResumes)
  const [customizedResumes, setCustomizedResumes] = useState<CustomizedResume[]>(initialCustomizedResumes)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  
  // Filter resumes based on search query
  const filteredResumes = resumes.filter(resume => 
    resume.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    resume.skills?.some(skill => skill.toLowerCase().includes(searchQuery.toLowerCase()))
  )
  
  const filteredCustomizedResumes = customizedResumes.filter(resume =>
    resume.title.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleDelete = async (id: string, isCustomized: boolean = false) => {
    if (!confirm('Are you sure you want to delete this resume?')) return
    
    setDeletingId(id)
    const supabase = createClient()
    
    const { error } = await supabase
      .from(isCustomized ? 'customized_resumes' : 'resumes')
      .delete()
      .eq('id', id)

    if (error) {
      toast.error('Failed to delete resume')
      setDeletingId(null)
      return
    }

    if (isCustomized) {
      setCustomizedResumes(customizedResumes.filter(r => r.id !== id))
    } else {
      setResumes(resumes.filter(r => r.id !== id))
    }
    toast.success('Resume deleted')
    setDeletingId(null)
  }

  const handleDownload = (id: string, format: 'pdf' | 'docx' | 'txt' = 'pdf') => {
    // For PDF, use the preview page with download parameter
    // For other formats, the preview page will handle them
    window.open(`/resumes/${id}/preview?download=true&format=${format}`, '_blank')
  }

  return (
    <div className="space-y-6">
      {/* Header with gradient accent */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-500/25">
              <FileText className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-800 dark:text-slate-100">My Resumes</h1>
              <p className="text-slate-500 dark:text-slate-400 text-sm">
                {resumes.length + customizedResumes.length} resume{resumes.length + customizedResumes.length !== 1 ? 's' : ''} • {resumes.length} original, {customizedResumes.length} AI-customized
              </p>
            </div>
          </div>
          <Link href="/resumes/new">
            <Button className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 shadow-md shadow-violet-500/25">
              <Plus className="mr-2 h-4 w-4" />
              New Resume
            </Button>
          </Link>
        </div>
        
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            type="text"
            placeholder="Search resumes, templates..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800"
          />
        </div>
      </div>

      {(resumes && resumes.length > 0) || (customizedResumes && customizedResumes.length > 0) ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredResumes.map((resume, index) => (
            <Card key={resume.id} className="group border-slate-200 dark:border-slate-800 hover:border-violet-300 dark:hover:border-violet-700 hover:shadow-lg hover:shadow-violet-500/10 transition-all duration-300 overflow-hidden flex flex-col h-full">
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-violet-500/5 to-transparent rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-500" />
              <CardHeader className="flex flex-row items-start justify-between space-y-0 relative">
                <div className="flex items-start gap-3">
                  <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-slate-100 to-slate-50 dark:from-slate-800 dark:to-slate-900 flex items-center justify-center border border-slate-200 dark:border-slate-700 group-hover:border-violet-300 dark:group-hover:border-violet-700 transition-colors">
                    <FileText className="h-5 w-5 text-slate-500 group-hover:text-violet-500 transition-colors" />
                  </div>
                  <div>
                    <CardTitle className="text-base font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                      {resume.title}
                      {resume.is_primary && (
                        <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
                      )}
                    </CardTitle>
                    <CardDescription className="flex items-center gap-1 text-xs mt-1">
                      <Clock className="h-3 w-3" />
                      {new Date(resume.updated_at || resume.created_at!).toLocaleDateString()}
                    </CardDescription>
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild>
                      <Link href={`/resumes/${resume.id}`}>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href={`/resumes/${resume.id}/preview`}>
                        <Eye className="mr-2 h-4 w-4" />
                        Preview
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleDownload(resume.id, 'pdf')}>
                      <Download className="mr-2 h-4 w-4" />
                      Download PDF
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleDownload(resume.id, 'docx')}>
                      <Download className="mr-2 h-4 w-4" />
                      Download DOCX
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleDownload(resume.id, 'txt')}>
                      <Download className="mr-2 h-4 w-4" />
                      Download TXT
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      className="text-destructive"
                      onClick={() => handleDelete(resume.id)}
                      disabled={deletingId === resume.id}
                    >
                      {deletingId === resume.id ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="mr-2 h-4 w-4" />
                      )}
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </CardHeader>
              <CardContent className="pt-0">
                {resume.skills && resume.skills.length > 0 && (
                  <div className="flex items-center gap-1.5 flex-wrap mb-4">
                    {resume.skills.slice(0, 3).map((skill) => (
                      <Badge key={skill} variant="secondary" className="text-xs bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200">
                        {skill}
                      </Badge>
                    ))}
                    {resume.skills.length > 3 && (
                      <Badge variant="outline" className="text-xs">+{resume.skills.length - 3}</Badge>
                    )}
                  </div>
                )}
                <div className="flex gap-2 mt-auto">
                  <Link href={`/resumes/${resume.id}`} className="flex-1">
                    <Button variant="outline" className="w-full h-9 text-sm border-slate-200 dark:border-slate-700 hover:border-slate-300 hover:bg-slate-50">
                      <Edit className="h-3.5 w-3.5 mr-1.5" />
                      Edit
                    </Button>
                  </Link>
                  <Link href={`/customize?resume=${resume.id}`} className="flex-1">
                    <Button className="w-full h-9 text-sm bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700">
                      <Sparkles className="h-3.5 w-3.5 mr-1.5" />
                      Customize
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
          
          {/* AI-Customized Resumes */}
          {filteredCustomizedResumes.map((resume) => (
            <Card key={resume.id} className="group border-emerald-200 dark:border-emerald-800 hover:border-emerald-300 dark:hover:border-emerald-700 hover:shadow-lg hover:shadow-emerald-500/10 transition-all duration-300 overflow-hidden flex flex-col h-full">
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-emerald-500/5 to-transparent rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-500" />
              <CardHeader className="flex flex-row items-start justify-between space-y-0 relative">
                <div className="flex items-start gap-3">
                  <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-emerald-100 to-teal-50 dark:from-emerald-900 dark:to-teal-900 flex items-center justify-center border border-emerald-200 dark:border-emerald-700 group-hover:border-emerald-300 dark:group-hover:border-emerald-600 transition-colors">
                    <Sparkles className="h-5 w-5 text-emerald-600 dark:text-emerald-400 group-hover:text-emerald-500 transition-colors" />
                  </div>
                  <div>
                    <CardTitle className="text-base font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                      {resume.title}
                      <Badge variant="secondary" className="bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300 text-xs">
                        AI Customized
                      </Badge>
                    </CardTitle>
                    <CardDescription className="flex items-center gap-1 text-xs mt-1">
                      <Clock className="h-3 w-3" />
                      {new Date(resume.created_at!).toLocaleDateString()}
                      {resume.match_score && (
                        <>
                          <span className="mx-1">•</span>
                          <span className="text-emerald-600 dark:text-emerald-400 font-medium">{resume.match_score}% match</span>
                        </>
                      )}
                    </CardDescription>
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild>
                      <Link href={`/resumes/${resume.id}/preview`}>
                        <Eye className="mr-2 h-4 w-4" />
                        Preview
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => resume.source_resume_id && handleDownload(resume.source_resume_id, 'pdf')}>
                      <Download className="mr-2 h-4 w-4" />
                      Download PDF
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => resume.source_resume_id && handleDownload(resume.source_resume_id, 'docx')}>
                      <Download className="mr-2 h-4 w-4" />
                      Download DOCX
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => resume.source_resume_id && handleDownload(resume.source_resume_id, 'txt')}>
                      <Download className="mr-2 h-4 w-4" />
                      Download TXT
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      className="text-destructive"
                      onClick={() => handleDelete(resume.id, true)}
                      disabled={deletingId === resume.id}
                    >
                      {deletingId === resume.id ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="mr-2 h-4 w-4" />
                      )}
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </CardHeader>
              <CardContent className="pt-0 flex-1 flex flex-col">
                {/* Cover Letter Badge */}
                {resume.cover_letter && (
                  <div className="mb-3 flex items-center gap-2 p-2 bg-emerald-50 dark:bg-emerald-950 rounded-lg border border-emerald-200 dark:border-emerald-800">
                    <Mail className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                    <span className="text-xs font-medium text-emerald-700 dark:text-emerald-300">Cover Letter Included</span>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="ml-auto h-6 px-2 text-xs"
                      onClick={async () => {
                        await navigator.clipboard.writeText(resume.cover_letter!)
                        toast.success('Cover letter copied to clipboard!')
                      }}
                    >
                      <Copy className="h-3 w-3 mr-1" />
                      Copy
                    </Button>
                  </div>
                )}
                
                <div className="flex gap-2 mt-auto">
                  <Link href={`/resumes/${resume.id}/preview`} className="flex-1">
                    <Button variant="outline" className="w-full h-9 text-sm border-emerald-200 dark:border-emerald-700 hover:border-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-950">
                      <Eye className="h-3.5 w-3.5 mr-1.5" />
                      Preview
                    </Button>
                  </Link>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="hover:bg-slate-100 dark:hover:bg-slate-800"
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleDownload(resume.id, 'pdf')}>
                        <FileText className="mr-2 h-4 w-4" />
                        PDF
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDownload(resume.id, 'docx')}>
                        <FileText className="mr-2 h-4 w-4" />
                        DOCX
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDownload(resume.id, 'txt')}>
                        <FileText className="mr-2 h-4 w-4" />
                        TXT
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="border-2 border-dashed border-slate-200 dark:border-slate-800">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-violet-100 to-indigo-100 dark:from-violet-900/30 dark:to-indigo-900/30 flex items-center justify-center mb-6">
              <FileText className="h-10 w-10 text-violet-500" />
            </div>
            <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-200 mb-2">No resumes yet</h3>
            <p className="text-slate-500 text-center mb-6 max-w-sm">
              Create your first resume to get started. Build from scratch or upload an existing document.
            </p>
            <Link href="/resumes/new">
              <Button size="lg" className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 shadow-lg shadow-violet-500/25">
                <Plus className="mr-2 h-5 w-5" />
                Create Your First Resume
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
