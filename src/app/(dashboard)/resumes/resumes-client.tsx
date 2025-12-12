'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { FileText, Plus, MoreVertical, Download, Trash2, Edit, Eye, Loader2 } from 'lucide-react'
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Resumes</h1>
          <p className="text-muted-foreground mt-1">
            Manage and edit your resume documents
          </p>
        </div>
        <Link href="/resumes/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Resume
          </Button>
        </Link>
      </div>

      {resumes && resumes.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {resumes.map((resume) => (
            <Card key={resume.id} className="group hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-start justify-between space-y-0">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <FileText className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{resume.title}</CardTitle>
                    <CardDescription>
                      {new Date(resume.updated_at || resume.created_at!).toLocaleDateString()}
                    </CardDescription>
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity">
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
              <CardContent>
                <div className="flex items-center gap-2 flex-wrap">
                  {resume.is_primary && (
                    <Badge variant="default">Primary</Badge>
                  )}
                  {resume.skills && resume.skills.slice(0, 3).map((skill) => (
                    <Badge key={skill} variant="secondary">{skill}</Badge>
                  ))}
                  {resume.skills && resume.skills.length > 3 && (
                    <Badge variant="outline">+{resume.skills.length - 3}</Badge>
                  )}
                </div>
                <div className="mt-4 flex gap-2">
                  <Link href={`/resumes/${resume.id}`} className="flex-1">
                    <Button variant="outline" className="w-full">Edit</Button>
                  </Link>
                  <Link href={`/customize?resume=${resume.id}`} className="flex-1">
                    <Button className="w-full">Customize</Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="p-4 bg-muted rounded-full mb-4">
              <FileText className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No resumes yet</h3>
            <p className="text-muted-foreground text-center mb-4 max-w-sm">
              Create your first resume to get started. You can build from scratch or upload an existing one.
            </p>
            <Link href="/resumes/new">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Create Resume
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
