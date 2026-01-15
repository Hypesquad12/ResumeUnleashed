import { CustomizeClient } from './customize-client'
import { createClient } from '@/lib/supabase/server'

export default async function CustomizePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  const { data: resumes } = await supabase
    .from('resumes')
    .select('id, title, updated_at, created_at')
    .eq('user_id', user!.id)
    .order('created_at', { ascending: false })

  // Fetch customization history
  const { data: history } = await supabase
    .from('customized_resumes')
    .select('id, title, source_resume_id, match_score, created_at, cover_letter')
    .eq('user_id', user!.id)
    .order('created_at', { ascending: false })
    .limit(10)

  return <CustomizeClient resumes={resumes || []} history={history || []} />
}
