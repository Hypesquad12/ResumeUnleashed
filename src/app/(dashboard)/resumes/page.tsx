import { createClient } from '@/lib/supabase/server'
import { ResumesClient } from './resumes-client'

export default async function ResumesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  const { data: resumes } = await supabase
    .from('resumes')
    .select('id, title, updated_at, created_at, is_primary, skills')
    .eq('user_id', user!.id)
    .order('created_at', { ascending: false })

  return <ResumesClient initialResumes={resumes || []} />
}
