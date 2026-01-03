'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Mail, MapPin, Phone, Send } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    toast.success('Message sent successfully! We\'ll get back to you soon.')
    setFormData({ name: '', email: '', subject: '', message: '' })
    setIsSubmitting(false)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-orange-500 to-red-500 flex items-center justify-center">
          <Mail className="h-6 w-6 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Contact Us</h1>
          <p className="text-slate-500">Get in touch with our team</p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Contact Form */}
        <Card>
          <CardHeader>
            <CardTitle>Send us a Message</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  placeholder="Your full name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  placeholder="your.email@example.com"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="subject">Subject *</Label>
                <Input
                  id="subject"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  required
                  placeholder="How can we help?"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="message">Message *</Label>
                <Textarea
                  id="message"
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  required
                  placeholder="Tell us more about your inquiry..."
                  rows={5}
                />
              </div>

              <Button 
                type="submit" 
                className="w-full"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  'Sending...'
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Send Message
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-violet-100 flex items-center justify-center flex-shrink-0">
                  <Mail className="h-5 w-5 text-violet-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-800">Email</h3>
                  <p className="text-slate-600">info@hypesquad.ai</p>
                  <p className="text-sm text-slate-500">We'll respond within 24 hours</p>
                </div>
              </div>

            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Frequently Asked Questions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <h3 className="font-semibold text-slate-800 mb-1">How quickly will I get a response?</h3>
                <p className="text-sm text-slate-600">
                  We typically respond to all inquiries within 24 hours during business days.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-slate-800 mb-1">What should I include in my message?</h3>
                <p className="text-sm text-slate-600">
                  Please provide as much detail as possible about your issue or question, including any relevant account information.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-slate-800 mb-1">Do you offer phone support?</h3>
                <p className="text-sm text-slate-600">
                  Yes, phone support is available for premium subscribers during business hours.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Other Ways to Reach Us</CardTitle>
        </CardHeader>
        <CardContent className="prose prose-slate max-w-none">
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <h3 className="text-lg font-semibold mb-2">Technical Support</h3>
              <p className="text-sm text-slate-600">
                For technical issues, bugs, or platform errors, email us at <strong>info@hypesquad.ai</strong>
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">Business Inquiries</h3>
              <p className="text-sm text-slate-600">
                For partnerships, enterprise plans, or business opportunities, contact <strong>info@hypesquad.ai</strong>
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">Billing & Refunds</h3>
              <p className="text-sm text-slate-600">
                For payment issues or refund requests, reach out to <strong>info@hypesquad.ai</strong>
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
