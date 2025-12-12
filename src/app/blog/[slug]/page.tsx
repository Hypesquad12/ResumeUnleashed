import { getBlogPost, getAllBlogPosts } from '@/lib/blog-data'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Calendar, Clock, ArrowLeft, ArrowRight, BookOpen, Share2 } from 'lucide-react'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Metadata } from 'next'

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const post = getBlogPost(slug)
  
  if (!post) {
    return { title: 'Post Not Found' }
  }

  return {
    title: `${post.title} | ResumeAI Blog`,
    description: post.excerpt,
    keywords: post.tags.join(', '),
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: 'article',
      publishedTime: post.publishedAt,
      authors: [post.author],
    },
  }
}

export async function generateStaticParams() {
  const posts = getAllBlogPosts()
  return posts.map(post => ({ slug: post.slug }))
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params
  const post = getBlogPost(slug)

  if (!post) {
    notFound()
  }

  const allPosts = getAllBlogPosts()
  const currentIndex = allPosts.findIndex(p => p.slug === slug)
  const prevPost = currentIndex < allPosts.length - 1 ? allPosts[currentIndex + 1] : null
  const nextPost = currentIndex > 0 ? allPosts[currentIndex - 1] : null

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/blog" className="flex items-center gap-2">
            <div className="p-1.5 bg-primary rounded-lg">
              <BookOpen className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="font-semibold text-lg">ResumeAI Blog</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost">Home</Button>
            </Link>
            <Link href="/login">
              <Button>Get Started</Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        {/* Back Link */}
        <Link href="/blog" className="inline-flex items-center text-muted-foreground hover:text-foreground mb-8">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Blog
        </Link>

        <article className="max-w-3xl mx-auto">
          {/* Article Header */}
          <header className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <Badge>{post.category}</Badge>
              {post.tags.slice(0, 3).map(tag => (
                <Badge key={tag} variant="outline">{tag}</Badge>
              ))}
            </div>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight mb-4">
              {post.title}
            </h1>
            <p className="text-xl text-muted-foreground mb-6">{post.excerpt}</p>
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span>By {post.author}</span>
                <span className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {new Date(post.publishedAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {post.readTime}
                </span>
              </div>
              <Button variant="outline" size="sm">
                <Share2 className="mr-2 h-4 w-4" />
                Share
              </Button>
            </div>
          </header>

          {/* Article Content */}
          <div className="prose prose-lg dark:prose-invert max-w-none">
            {post.content.split('\n').map((paragraph, index) => {
              if (paragraph.startsWith('# ')) {
                return <h1 key={index} className="text-3xl font-bold mt-8 mb-4">{paragraph.slice(2)}</h1>
              }
              if (paragraph.startsWith('## ')) {
                return <h2 key={index} className="text-2xl font-bold mt-8 mb-4">{paragraph.slice(3)}</h2>
              }
              if (paragraph.startsWith('### ')) {
                return <h3 key={index} className="text-xl font-semibold mt-6 mb-3">{paragraph.slice(4)}</h3>
              }
              if (paragraph.startsWith('- ')) {
                return <li key={index} className="ml-4">{paragraph.slice(2)}</li>
              }
              if (paragraph.startsWith('✅') || paragraph.startsWith('❌')) {
                return <p key={index} className="my-2">{paragraph}</p>
              }
              if (paragraph.startsWith('**') && paragraph.endsWith('**')) {
                return <p key={index} className="font-bold my-4">{paragraph.slice(2, -2)}</p>
              }
              if (paragraph.trim() === '') {
                return null
              }
              return <p key={index} className="my-4 leading-relaxed">{paragraph}</p>
            })}
          </div>

          {/* Tags */}
          <div className="mt-12 pt-8 border-t">
            <h3 className="font-semibold mb-4">Tags</h3>
            <div className="flex flex-wrap gap-2">
              {post.tags.map(tag => (
                <Badge key={tag} variant="secondary">{tag}</Badge>
              ))}
            </div>
          </div>

          {/* CTA */}
          <div className="mt-12 bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10 rounded-xl p-8 text-center">
            <h3 className="text-2xl font-bold mb-2">Ready to Apply These Tips?</h3>
            <p className="text-muted-foreground mb-4">
              Create your professional resume with our AI-powered builder.
            </p>
            <Link href="/signup">
              <Button size="lg">
                Build Your Resume <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="mt-12 pt-8 border-t grid md:grid-cols-2 gap-4">
            {prevPost && (
              <Link href={`/blog/${prevPost.slug}`} className="group">
                <div className="p-4 rounded-lg border hover:bg-muted/50 transition-colors">
                  <span className="text-sm text-muted-foreground flex items-center gap-1">
                    <ArrowLeft className="h-3 w-3" /> Previous
                  </span>
                  <p className="font-medium group-hover:text-primary transition-colors line-clamp-1">
                    {prevPost.title}
                  </p>
                </div>
              </Link>
            )}
            {nextPost && (
              <Link href={`/blog/${nextPost.slug}`} className="group md:text-right md:ml-auto">
                <div className="p-4 rounded-lg border hover:bg-muted/50 transition-colors">
                  <span className="text-sm text-muted-foreground flex items-center gap-1 md:justify-end">
                    Next <ArrowRight className="h-3 w-3" />
                  </span>
                  <p className="font-medium group-hover:text-primary transition-colors line-clamp-1">
                    {nextPost.title}
                  </p>
                </div>
              </Link>
            )}
          </nav>
        </article>
      </main>

      {/* Footer */}
      <footer className="border-t mt-16 py-8">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p>© 2024 ResumeAI. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
