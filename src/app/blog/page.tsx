import { getAllBlogPosts } from '@/lib/blog-data'
import { Button } from '@/components/ui/button'
import { FileText } from 'lucide-react'
import Link from 'next/link'
import { BlogClient } from './blog-client'

export const metadata = {
  title: 'Blog | Resume Unleashed - Resume Builder & Resume Maker Tips',
  description: 'Expert tips on using our resume builder and resume maker, job search strategies, interview preparation, and career advice. Learn how to write a resume that gets noticed.',
  keywords: 'resume builder, resume maker, how to write a resume, resume templates, job application tips, career advice, ATS resume, interview tips',
}

export default function BlogPage() {
  const posts = getAllBlogPosts()

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-md sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="p-1.5 bg-gradient-to-br from-teal-500 to-cyan-500 rounded-lg shadow-lg shadow-teal-500/20">
              <FileText className="h-5 w-5 text-white" />
            </div>
            <span className="font-bold text-lg text-slate-800">Resume Unleashed</span>
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

      <BlogClient posts={posts} />

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
