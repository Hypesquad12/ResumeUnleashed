import { MetadataRoute } from 'next'
import { createClient } from '@/lib/supabase/server'
import { getAllBlogPosts } from '@/lib/blog-data'

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
    '/templates',
    '/blog',
    '/contact',
    '/terms',
    '/privacy',
    '/refunds',
    '/shipping',
    '/changelog',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: route === '' ? 1 : 0.8,
  }))

  // Blog posts from static data
  const blogPosts = getAllBlogPosts()
  const blogRoutes = blogPosts.map((post) => ({
    url: `${baseUrl}/blog/${post.slug}`,
    lastModified: new Date(post.publishedAt),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }))

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

  return [...routes, ...blogRoutes, ...resumeRoutes, ...cardRoutes]
}
