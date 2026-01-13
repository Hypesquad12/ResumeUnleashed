import { getBlogPost, getAllBlogPosts } from '@/lib/blog-data'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Calendar, Clock, ArrowLeft, ArrowRight, FileText, Share2, Twitter, Linkedin, Facebook } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
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
    title: `${post.title} | Resume Unleashed Blog`,
    description: post.excerpt,
    keywords: post.tags.join(', '),
    robots: {
      index: true,
      follow: true,
    },
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: 'article',
      publishedTime: post.publishedAt,
      authors: [post.author],
      images: [post.image],
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
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-md sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/blog" className="flex items-center gap-2">
            <div className="p-1.5 bg-gradient-to-br from-teal-500 to-cyan-500 rounded-lg shadow-lg shadow-teal-500/20">
              <FileText className="h-5 w-5 text-white" />
            </div>
            <span className="font-bold text-lg text-slate-800">Resume Unleashed</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" className="text-slate-600 hover:text-slate-900">Home</Button>
            </Link>
            <Link href="/">
              <Button className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white border-0 shadow-lg shadow-teal-500/25">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Image */}
      <div className="relative h-[40vh] md:h-[50vh] w-full overflow-hidden">
        <Image
          src={post.image}
          alt={post.title}
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/40 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-8 md:p-12">
          <div className="container mx-auto max-w-5xl">
            <Link href="/blog" className="inline-flex items-center text-white/80 hover:text-white mb-4 transition-colors">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Blog
            </Link>
            <Badge className="mb-4 bg-teal-500 text-white">{post.category}</Badge>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-white mb-4">
              {post.title}
            </h1>
          </div>
        </div>
      </div>

      <main className="container mx-auto px-4 py-12">
        <article className="max-w-5xl mx-auto">
          {/* Author & Meta */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10 pb-8 border-b border-slate-200">
            <div className="flex items-center gap-4">
              <div className="relative w-14 h-14 rounded-full overflow-hidden ring-4 ring-teal-500/20">
                <Image
                  src={post.authorImage}
                  alt={post.author}
                  fill
                  className="object-cover"
                />
              </div>
              <div>
                <p className="font-semibold text-slate-900 text-lg">{post.author}</p>
                <div className="flex items-center gap-3 text-sm text-slate-500">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {new Date(post.publishedAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {post.readTime} read
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-500 mr-2">Share:</span>
              <Button variant="outline" size="icon" className="h-9 w-9 rounded-full border-slate-300 hover:bg-slate-100">
                <Twitter className="h-4 w-4 text-slate-600" />
              </Button>
              <Button variant="outline" size="icon" className="h-9 w-9 rounded-full border-slate-300 hover:bg-slate-100">
                <Linkedin className="h-4 w-4 text-slate-600" />
              </Button>
              <Button variant="outline" size="icon" className="h-9 w-9 rounded-full border-slate-300 hover:bg-slate-100">
                <Facebook className="h-4 w-4 text-slate-600" />
              </Button>
            </div>
          </div>

          {/* Excerpt */}
          <p className="text-xl text-slate-600 mb-10 leading-relaxed font-medium border-l-4 border-teal-500 pl-6 italic">
            {post.excerpt}
          </p>

          <div className="mb-10 rounded-xl border border-slate-200 bg-slate-50 p-5">
            <p className="text-slate-700">
              Want to turn these tips into a resume recruiters love?{' '}
              <Link href="/" className="text-teal-600 hover:text-teal-700 underline underline-offset-2 font-semibold">
                Visit Resume Unleashed
              </Link>
              {' '}to get started.
            </p>
          </div>

          {/* Article Content */}
          <div className="prose prose-lg prose-slate max-w-none prose-headings:text-slate-900 prose-p:text-slate-600 prose-p:leading-relaxed prose-p:text-justify prose-li:text-slate-600 prose-strong:text-slate-900">
            {post.content.split('\n').map((paragraph, index) => {
              // Helper function to parse inline markdown (bold, links)
              const parseInlineMarkdown = (text: string) => {
                const parts: React.ReactNode[] = []
                let remaining = text
                let keyIndex = 0
                
                while (remaining.length > 0) {
                  // Check for links: **[text](/url)** or [text](/url)
                  const linkMatch = remaining.match(/\*?\*?\[([^\]]+)\]\(([^)]+)\)\*?\*?/)
                  const boldMatch = remaining.match(/\*\*([^*]+)\*\*/)
                  
                  if (linkMatch && (!boldMatch || remaining.indexOf(linkMatch[0]) <= remaining.indexOf(boldMatch[0]))) {
                    const beforeLink = remaining.slice(0, remaining.indexOf(linkMatch[0]))
                    if (beforeLink) parts.push(beforeLink)
                    
                    const isBoldLink = linkMatch[0].startsWith('**') && linkMatch[0].endsWith('**')
                    parts.push(
                      <Link 
                        key={`link-${index}-${keyIndex++}`} 
                        href={linkMatch[2]} 
                        className={`text-teal-600 hover:text-teal-700 underline underline-offset-2 ${isBoldLink ? 'font-semibold' : ''}`}
                      >
                        {linkMatch[1]}
                      </Link>
                    )
                    remaining = remaining.slice(remaining.indexOf(linkMatch[0]) + linkMatch[0].length)
                  } else if (boldMatch) {
                    const beforeBold = remaining.slice(0, remaining.indexOf(boldMatch[0]))
                    if (beforeBold) parts.push(beforeBold)
                    parts.push(<strong key={`bold-${index}-${keyIndex++}`} className="text-slate-900 font-semibold">{boldMatch[1]}</strong>)
                    remaining = remaining.slice(remaining.indexOf(boldMatch[0]) + boldMatch[0].length)
                  } else {
                    parts.push(remaining)
                    break
                  }
                }
                return parts
              }

              if (paragraph.startsWith('# ')) {
                return <h1 key={index} className="text-3xl font-bold mt-12 mb-6 text-slate-900">{paragraph.slice(2)}</h1>
              }
              if (paragraph.startsWith('## ')) {
                return <h2 key={index} className="text-2xl font-bold mt-10 mb-5 text-slate-900 border-b border-slate-200 pb-3">{paragraph.slice(3)}</h2>
              }
              if (paragraph.startsWith('### ')) {
                return <h3 key={index} className="text-xl font-semibold mt-8 mb-4 text-slate-800">{paragraph.slice(4)}</h3>
              }
              if (paragraph.startsWith('- ')) {
                return <li key={index} className="ml-6 text-slate-600 my-2">{parseInlineMarkdown(paragraph.slice(2))}</li>
              }
              if (paragraph.startsWith('✅') || paragraph.startsWith('❌')) {
                return <p key={index} className="my-3 text-slate-600 bg-slate-50 px-4 py-2 rounded-lg">{paragraph}</p>
              }
              if (paragraph.startsWith('|')) {
                return <p key={index} className="my-2 text-slate-600 font-mono text-sm bg-slate-50 px-4 py-2 rounded">{paragraph}</p>
              }
              if (paragraph.trim() === '') {
                return null
              }
              return <p key={index} className="my-5 text-slate-600 leading-relaxed text-lg">{parseInlineMarkdown(paragraph)}</p>
            })}
          </div>

          {/* Tags */}
          <div className="mt-12 pt-8 border-t border-slate-200">
            <h3 className="font-semibold mb-4 text-slate-900">Related Topics</h3>
            <div className="flex flex-wrap gap-2">
              {post.tags.map(tag => (
                <Badge key={tag} variant="secondary" className="bg-slate-100 text-slate-700 hover:bg-slate-200 px-4 py-1.5">{tag}</Badge>
              ))}
            </div>
          </div>

          {/* CTA */}
          <div className="mt-12 relative overflow-hidden rounded-2xl">
            <div className="absolute inset-0 bg-gradient-to-r from-teal-500 to-cyan-500" />
            <div className="relative px-8 py-12 text-center">
              <h3 className="text-2xl md:text-3xl font-bold mb-3 text-white">Ready to Apply These Tips?</h3>
              <p className="text-teal-100 mb-6 max-w-lg mx-auto">
                Create your professional resume with our AI-powered builder and land your dream job.
              </p>
              <Link href="/">
                <Button size="lg" className="bg-white text-teal-600 hover:bg-teal-50 shadow-xl">
                  Build Your Resume <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>

          {/* Navigation */}
          <nav className="mt-12 pt-8 border-t border-slate-200 grid md:grid-cols-2 gap-6">
            {prevPost && (
              <Link href={`/blog/${prevPost.slug}`} className="group">
                <div className="p-6 rounded-xl border border-slate-200 hover:border-teal-300 hover:shadow-lg transition-all bg-white">
                  <span className="text-sm text-slate-500 flex items-center gap-1 mb-2">
                    <ArrowLeft className="h-3 w-3" /> Previous Article
                  </span>
                  <p className="font-semibold text-slate-900 group-hover:text-teal-600 transition-colors line-clamp-2">
                    {prevPost.title}
                  </p>
                </div>
              </Link>
            )}
            {nextPost && (
              <Link href={`/blog/${nextPost.slug}`} className="group md:text-right md:ml-auto">
                <div className="p-6 rounded-xl border border-slate-200 hover:border-teal-300 hover:shadow-lg transition-all bg-white">
                  <span className="text-sm text-slate-500 flex items-center gap-1 md:justify-end mb-2">
                    Next Article <ArrowRight className="h-3 w-3" />
                  </span>
                  <p className="font-semibold text-slate-900 group-hover:text-teal-600 transition-colors line-clamp-2">
                    {nextPost.title}
                  </p>
                </div>
              </Link>
            )}
          </nav>
        </article>
      </main>

      {/* Footer */}
      <footer className="border-t mt-20 py-12 bg-slate-50">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-gradient-to-br from-teal-500 to-cyan-500 rounded-lg">
                <FileText className="h-4 w-4 text-white" />
              </div>
              <span className="font-semibold text-slate-800">Resume Unleashed</span>
            </div>
            <p className="text-slate-500 text-sm">© 2024 Resume Unleashed. All rights reserved.</p>
            <div className="flex items-center gap-6 text-sm text-slate-600">
              <Link href="/" className="hover:text-teal-600 transition-colors">Home</Link>
              <Link href="/blog" className="hover:text-teal-600 transition-colors">Blog</Link>
              <Link href="/templates" className="hover:text-teal-600 transition-colors">Templates</Link>
              <Link href="/login" className="hover:text-teal-600 transition-colors">Sign In</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
