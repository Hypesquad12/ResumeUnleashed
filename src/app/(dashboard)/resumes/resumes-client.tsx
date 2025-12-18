'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { FileText, Plus, MoreVertical, Download, Trash2, Edit, Eye, Loader2, Sparkles, Clock, ChevronRight, Star } from 'lucide-react'
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

interface ResumesClientProps {
  initialResumes: Resume[]
}

export function ResumesClient({ initialResumes }: ResumesClientProps) {
  const router = useRouter()
  const [resumes, setResumes] = useState<Resume[]>(initialResumes)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this resume?')) return
    
    setDeletingId(id)
    const supabase = createClient()
    
    const { error } = await supabase
      .from('resumes')
      .delete()
      .eq('id', id)

    if (error) {
      toast.error('Failed to delete resume')
      setDeletingId(null)
      return
    }

    setResumes(resumes.filter(r => r.id !== id))
    toast.success('Resume deleted')
    setDeletingId(null)
  }

  const handleDownload = (id: string) => {
    window.open(`/resumes/${id}/preview?download=true`, '_blank')
  }

  return (
    <div className="space-y-6">
      {/* Header with gradient accent */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-500/25">
            <FileText className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-800 dark:text-slate-100">My Resumes</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm">
              {resumes.length} resume{resumes.length !== 1 ? 's' : ''} • Manage and customize your documents
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

      {resumes && resumes.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {resumes.map((resume, index) => (
            <Card key={resume.id} className="group border-slate-200 dark:border-slate-800 hover:border-violet-300 dark:hover:border-violet-700 hover:shadow-lg hover:shadow-violet-500/10 transition-all duration-300 overflow-hidden">
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
                    <DropdownMenuItem onClick={() => handleDownload(resume.id)}>
                      <Download className="mr-2 h-4 w-4" />
                      Download PDF
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
                <div className="flex gap-2">
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
