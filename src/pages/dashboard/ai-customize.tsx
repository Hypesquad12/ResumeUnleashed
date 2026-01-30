import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { CustomizeClient } from '@/app/(dashboard)/customize/customize-client'

export default function AICustomizePage() {
  const [loading, setLoading] = useState(true)
  const [resumes, setResumes] = useState<any[]>([])
  const [history, setHistory] = useState<any[]>([])

  useEffect(() => {
    async function fetchData() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) return

      const [{ data: resumesData }, { data: historyData }] = await Promise.all([
        supabase
          .from('resumes')
          .select('id, title, updated_at, created_at')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false }),
        supabase
          .from('customized_resumes')
          .select('id, title, source_resume_id, match_score, created_at, cover_letter')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(10),
      ])

      setResumes(resumesData || [])
      setHistory(historyData || [])
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

  return <CustomizeClient resumes={resumes} history={history} />
}
