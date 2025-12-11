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

  return <CustomizeClient resumes={resumes || []} />
}
