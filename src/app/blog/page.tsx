import { getAllBlogPosts } from '@/lib/blog-data'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Calendar, Clock, ArrowRight, FileText, User } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

export const metadata = {
  title: 'Blog | ResumeAI - Resume Building Tips & Career Advice',
  description: 'Expert tips on resume writing, job search strategies, interview preparation, and career advice. Learn how to write a resume that gets noticed.',
  keywords: 'resume builder, how to write a resume, resume templates, job application tips, career advice, ATS resume, interview tips',
}

export default function BlogPage() {
  const posts = getAllBlogPosts()
  const featuredPost = posts[0]
  const recentPosts = posts.slice(1)

  const categories = [...new Set(posts.map(p => p.category))]

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-md sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="p-1.5 bg-gradient-to-br from-teal-500 to-cyan-500 rounded-lg shadow-lg shadow-teal-500/20">
              <FileText className="h-5 w-5 text-white" />
            </div>
            <span className="font-bold text-lg text-slate-800">ResumeAI</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" className="text-slate-600 hover:text-slate-900">Home</Button>
            </Link>
            <Link href="/login">
              <Button className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white border-0 shadow-lg shadow-teal-500/25">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <Badge className="mb-4 bg-teal-100 text-teal-700 hover:bg-teal-100">Career Resources</Badge>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6 bg-gradient-to-r from-slate-900 via-slate-700 to-slate-900 bg-clip-text text-transparent">
            Career Insights & Resume Tips
          </h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Expert advice on resume writing, job search strategies, and career development to help you land your dream job.
          </p>
        </div>

        {/* Categories */}
        <div className="flex flex-wrap justify-center gap-3 mb-16">
          <Badge variant="secondary" className="px-5 py-2.5 text-sm cursor-pointer bg-teal-500 text-white hover:bg-teal-600 transition-colors">
            All Posts
          </Badge>
          {categories.map(category => (
            <Badge key={category} variant="outline" className="px-5 py-2.5 text-sm cursor-pointer border-slate-300 text-slate-600 hover:bg-slate-100 hover:border-slate-400 transition-colors">
              {category}
            </Badge>
          ))}
        </div>

        {/* Featured Post */}
        {featuredPost && (
          <Link href={`/blog/${featuredPost.slug}`} className="block mb-16 group">
            <Card className="overflow-hidden hover:shadow-2xl transition-all duration-300 border-0 shadow-lg bg-white">
              <div className="grid md:grid-cols-2">
                <div className="relative aspect-video md:aspect-auto md:min-h-[400px] overflow-hidden">
                  <Image
                    src={featuredPost.image}
                    alt={featuredPost.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                  <Badge className="absolute top-4 left-4 bg-teal-500 text-white">{featuredPost.category}</Badge>
                </div>
                <div className="p-8 md:p-10 flex flex-col justify-center">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="relative w-10 h-10 rounded-full overflow-hidden ring-2 ring-teal-500/20">
                      <Image
                        src={featuredPost.authorImage}
                        alt={featuredPost.author}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div>
                      <p className="font-medium text-slate-900">{featuredPost.author}</p>
                      <p className="text-sm text-slate-500">{new Date(featuredPost.publishedAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
                    </div>
                  </div>
                  <h2 className="text-2xl md:text-3xl font-bold mb-4 text-slate-900 group-hover:text-teal-600 transition-colors">{featuredPost.title}</h2>
                  <p className="text-slate-600 mb-6 leading-relaxed">{featuredPost.excerpt}</p>
                  <div className="flex items-center gap-4 text-sm text-slate-500 mb-6">
                    <span className="flex items-center gap-1.5">
                      <Clock className="h-4 w-4" />
                      {featuredPost.readTime} read
                    </span>
                  </div>
                  <Button className="w-fit bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white border-0 shadow-lg shadow-teal-500/25">
                    Read Article <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </div>
              </div>
            </Card>
          </Link>
        )}

        {/* Recent Posts Grid */}
        <div className="mb-8 flex items-center justify-between">
          <h2 className="text-2xl md:text-3xl font-bold text-slate-900">Recent Articles</h2>
          <div className="h-px flex-1 bg-gradient-to-r from-slate-200 to-transparent ml-6" />
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {recentPosts.map(post => (
            <Link key={post.slug} href={`/blog/${post.slug}`} className="group">
              <Card className="h-full hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border-0 shadow-md bg-white overflow-hidden">
                <div className="relative aspect-[16/10] overflow-hidden">
                  <Image
                    src={post.image}
                    alt={post.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                  <Badge className="absolute top-3 left-3 bg-white/90 text-slate-700 text-xs">{post.category}</Badge>
                </div>
                <CardHeader className="pb-2 pt-5">
                  <CardTitle className="text-lg line-clamp-2 text-slate-900 group-hover:text-teal-600 transition-colors">{post.title}</CardTitle>
                </CardHeader>
                <CardContent className="pb-5">
                  <CardDescription className="line-clamp-2 mb-4 text-slate-600">{post.excerpt}</CardDescription>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="relative w-7 h-7 rounded-full overflow-hidden">
                        <Image
                          src={post.authorImage}
                          alt={post.author}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <span className="text-sm text-slate-600">{post.author}</span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-slate-500">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {post.readTime}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {/* CTA Section */}
        <div className="mt-20 relative overflow-hidden rounded-3xl">
          <div className="absolute inset-0 bg-gradient-to-r from-teal-500 to-cyan-500" />
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRjMC0yIDItNCAyLTRzLTItMi00LTJjLTIgMC00IDItNCAyczIgMiA0IDJjMiAwIDQtMiA0LTJ6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-30" />
          <div className="relative px-8 py-16 md:py-20 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">Ready to Build Your Perfect Resume?</h2>
            <p className="text-teal-100 mb-8 max-w-xl mx-auto text-lg">
              Put these tips into action with our AI-powered resume builder. Create ATS-optimized resumes in minutes.
            </p>
            <Link href="/signup">
              <Button size="lg" className="bg-white text-teal-600 hover:bg-teal-50 shadow-xl">
                Start Building for Free <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t mt-20 py-12 bg-slate-50">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-gradient-to-br from-teal-500 to-cyan-500 rounded-lg">
                <FileText className="h-4 w-4 text-white" />
              </div>
              <span className="font-semibold text-slate-800">ResumeAI</span>
            </div>
            <p className="text-slate-500 text-sm">© 2024 ResumeAI. All rights reserved.</p>
            <div className="flex items-center gap-6 text-sm text-slate-600">
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
