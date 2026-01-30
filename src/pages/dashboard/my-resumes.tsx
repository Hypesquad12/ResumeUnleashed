import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { ResumesClient } from '@/app/(dashboard)/resumes/resumes-client'

export default function MyResumesPage() {
  const [loading, setLoading] = useState(true)
  const [resumes, setResumes] = useState<any[]>([])
  const [customizedResumes, setCustomizedResumes] = useState<any[]>([])

  useEffect(() => {
    async function fetchData() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) return

      const [{ data: resumesData }, { data: customizedData }] = await Promise.all([
        supabase
          .from('resumes')
          .select('id, title, updated_at, created_at, is_primary, skills')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false }),
        supabase
          .from('customized_resumes')
          .select('id, title, created_at, match_score, source_resume_id, cover_letter')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false }),
      ])

      setResumes(resumesData || [])
      setCustomizedResumes(customizedData || [])
      setLoading(false)
    }

    fetchData()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-600"></div>
      </div>
    )
  }

  return <ResumesClient initialResumes={resumes} initialCustomizedResumes={customizedResumes} />
}
