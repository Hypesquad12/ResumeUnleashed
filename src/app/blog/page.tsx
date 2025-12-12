import { getAllBlogPosts } from '@/lib/blog-data'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Calendar, Clock, ArrowRight, BookOpen } from 'lucide-react'
import Link from 'next/link'

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
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
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
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
            Career Insights & Resume Tips
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Expert advice on resume writing, job search strategies, and career development to help you land your dream job.
          </p>
        </div>

        {/* Categories */}
        <div className="flex flex-wrap justify-center gap-2 mb-12">
          <Badge variant="secondary" className="px-4 py-2 cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors">
            All Posts
          </Badge>
          {categories.map(category => (
            <Badge key={category} variant="outline" className="px-4 py-2 cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors">
              {category}
            </Badge>
          ))}
        </div>

        {/* Featured Post */}
        {featuredPost && (
          <Link href={`/blog/${featuredPost.slug}`} className="block mb-12">
            <Card className="overflow-hidden hover:shadow-lg transition-shadow bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="aspect-video md:aspect-auto bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                  <BookOpen className="h-24 w-24 text-primary/30" />
                </div>
                <div className="p-6 flex flex-col justify-center">
                  <Badge className="w-fit mb-4">{featuredPost.category}</Badge>
                  <h2 className="text-2xl md:text-3xl font-bold mb-3">{featuredPost.title}</h2>
                  <p className="text-muted-foreground mb-4">{featuredPost.excerpt}</p>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {new Date(featuredPost.publishedAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {featuredPost.readTime}
                    </span>
                  </div>
                  <Button className="w-fit">
                    Read Article <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          </Link>
        )}

        {/* Recent Posts Grid */}
        <h2 className="text-2xl font-bold mb-6">Recent Articles</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recentPosts.map(post => (
            <Link key={post.slug} href={`/blog/${post.slug}`}>
              <Card className="h-full hover:shadow-lg transition-all hover:-translate-y-1">
                <div className="aspect-video bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center">
                  <BookOpen className="h-12 w-12 text-muted-foreground/30" />
                </div>
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="secondary" className="text-xs">{post.category}</Badge>
                  </div>
                  <CardTitle className="text-lg line-clamp-2">{post.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="line-clamp-2 mb-4">{post.excerpt}</CardDescription>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {new Date(post.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {post.readTime}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {/* CTA Section */}
        <div className="mt-16 text-center bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10 rounded-2xl p-12">
          <h2 className="text-3xl font-bold mb-4">Ready to Build Your Perfect Resume?</h2>
          <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
            Put these tips into action with our AI-powered resume builder. Create ATS-optimized resumes in minutes.
          </p>
          <Link href="/signup">
            <Button size="lg">
              Start Building for Free <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
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
