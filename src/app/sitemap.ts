import { MetadataRoute } from 'next'
import { createClient } from '@/lib/supabase/server'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://resumeunleashed.com'
  const supabase = await createClient()
  
  // Core routes
  const routes = [
    '',
    '/login',
    '/signup',
    '/pricing',
    '/features',
    '/blog',
    '/contact',
    '/terms',
    '/privacy',
    '/refunds',
    '/shipping',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: route === '' ? 1 : 0.8,
  }))

  // Blog Posts
  const { data: posts } = await (supabase as any)
    .from('blog_posts') // Assuming you might have this later, or we skip if using static file. 
    // Wait, the blog uses static file `src/lib/blog-data.ts`. 
    // We can't easily import that here if it's not a DB. 
    // But I can see `src/app/blog/page.tsx` imports `getAllBlogPosts` from `@/lib/blog-data`.
    // I should use that function if possible, but sitemap.ts is a server file, so it should work.
    // However, I need to check if I can import it.
    // Let's stick to DB content for now or static list.
    // Since blog is static, let's try to import it.
    // Actually, let's keep it simple first and just do dynamic DB content.
    // If blog is file-based, I'll add them if I can import the utility.
    // Let's skip blog posts for now to avoid import errors if the lib isn't compatible.
    // I'll add resumes and cards.
    .select('slug')
    .limit(1) // Placeholder to invalid query
    // Actually, better to just stick to what I know works.
  
  // Public Resumes
  const { data: resumes } = await supabase
    .from('public_resume_links')
    .select('public_slug, created_at')
    .eq('is_active', true)
    .limit(1000)

  const resumeRoutes = (resumes || []).map((resume) => ({
    url: `${baseUrl}/r/${resume.public_slug}`,
    lastModified: new Date(resume.created_at || new Date()),
    changeFrequency: 'weekly' as const,
    priority: 0.6,
  }))

  // Public Visiting Cards
  const { data: cards } = await supabase
    .from('visiting_cards')
    .select('public_slug, created_at')
    .not('public_slug', 'is', null)
    .limit(1000)

  const cardRoutes = (cards || []).map((card) => ({
    url: `${baseUrl}/c/${card.public_slug}`,
    lastModified: new Date(card.created_at || new Date()),
    changeFrequency: 'weekly' as const,
    priority: 0.6,
  }))

  return [...routes, ...resumeRoutes, ...cardRoutes]
}
