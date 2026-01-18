import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Truck } from 'lucide-react'

import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Shipping Policy | Resume Unleashed',
  description: 'Shipping Policy. Information about digital delivery of our services and products.',
  keywords: 'shipping policy, digital delivery, service access',
  openGraph: {
    title: 'Shipping Policy | Resume Unleashed',
    description: 'Information about digital delivery of our services.',
    url: 'https://resumeunleashed.com/shipping',
    type: 'website',
  },
  alternates: {
    canonical: 'https://resumeunleashed.com/shipping',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function ShippingPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center">
          <Truck className="h-6 w-6 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Shipping Policy</h1>
          <p className="text-slate-500">Last updated: December 30, 2025</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Digital Service - No Physical Shipping</CardTitle>
        </CardHeader>
        <CardContent className="prose prose-slate max-w-none">
          <p>
            Resume Unleashed is a <strong>digital service platform</strong> that provides AI-powered resume building, 
            career tools, and professional services entirely online. We do not ship physical products.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>1. Digital Delivery</CardTitle>
        </CardHeader>
        <CardContent className="prose prose-slate max-w-none">
          <p>All our services are delivered digitally and instantly:</p>
          <ul>
            <li><strong>Resumes:</strong> Created, customized, and downloaded directly from your account</li>
            <li><strong>Templates:</strong> Instantly accessible upon purchase or subscription</li>
            <li><strong>AI Customization:</strong> Results available within seconds of processing</li>
            <li><strong>Interview Prep:</strong> Immediate access to practice sessions and feedback</li>
            <li><strong>Salary Guides:</strong> Real-time AI-powered salary insights</li>
            <li><strong>Digital Visiting Cards:</strong> Generated and shareable via QR codes instantly</li>
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>2. Access to Services</CardTitle>
        </CardHeader>
        <CardContent className="prose prose-slate max-w-none">
          <h3>Immediate Access</h3>
          <p>Upon successful registration or purchase:</p>
          <ul>
            <li>Free features are available immediately after account creation</li>
            <li>Premium features are activated instantly upon payment confirmation</li>
            <li>No waiting period or delivery time required</li>
          </ul>

          <h3>Account-Based Access</h3>
          <p>All services are accessed through your account:</p>
          <ul>
            <li>Log in from any device with internet connection</li>
            <li>Access your resumes, templates, and data anytime</li>
            <li>No downloads required for core functionality</li>
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>3. Download and Export</CardTitle>
        </CardHeader>
        <CardContent className="prose prose-slate max-w-none">
          <p>You can download your content in various formats:</p>
          <ul>
            <li><strong>PDF Format:</strong> Professional, print-ready resume downloads</li>
            <li><strong>Instant Download:</strong> Click download and receive your file immediately</li>
            <li><strong>Multiple Downloads:</strong> Download your resumes as many times as needed</li>
            <li><strong>QR Codes:</strong> Generate and download QR codes for visiting cards</li>
          </ul>
          <p>
            Downloads are processed on our servers and delivered to your browser instantly. 
            No shipping or delivery charges apply.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>4. Physical Products (If Applicable)</CardTitle>
        </CardHeader>
        <CardContent className="prose prose-slate max-w-none">
          <p>
            In the event we offer physical products in the future (such as printed resumes or business cards):
          </p>
          <ul>
            <li>Shipping costs will be clearly displayed at checkout</li>
            <li>Delivery times will vary based on location and shipping method</li>
            <li>Tracking information will be provided via email</li>
            <li>International shipping may incur customs fees (customer's responsibility)</li>
          </ul>
          <p>
            <em>Note: Currently, we do not offer any physical products or shipping services.</em>
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>5. Service Availability</CardTitle>
        </CardHeader>
        <CardContent className="prose prose-slate max-w-none">
          <p>Our digital services are available:</p>
          <ul>
            <li><strong>24/7 Access:</strong> Use our platform anytime, anywhere</li>
            <li><strong>Global Availability:</strong> Accessible from any country with internet</li>
            <li><strong>No Geographic Restrictions:</strong> Services available worldwide</li>
            <li><strong>Multi-Device:</strong> Access from desktop, tablet, or mobile</li>
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>6. Technical Requirements</CardTitle>
        </CardHeader>
        <CardContent className="prose prose-slate max-w-none">
          <p>To access our services, you need:</p>
          <ul>
            <li>Internet connection (broadband recommended)</li>
            <li>Modern web browser (Chrome, Firefox, Safari, Edge)</li>
            <li>JavaScript enabled</li>
            <li>PDF reader for downloading resumes</li>
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>7. Delivery Issues</CardTitle>
        </CardHeader>
        <CardContent className="prose prose-slate max-w-none">
          <p>If you experience issues accessing our services:</p>
          <ul>
            <li>Check your internet connection</li>
            <li>Clear browser cache and cookies</li>
            <li>Try a different browser or device</li>
            <li>Contact our support team through the Contact Us page</li>
          </ul>
          <p>
            We aim to resolve all technical issues within 24 hours of notification.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>8. Data Backup and Storage</CardTitle>
        </CardHeader>
        <CardContent className="prose prose-slate max-w-none">
          <p>Your data is securely stored and backed up:</p>
          <ul>
            <li>Automatic cloud backups ensure data safety</li>
            <li>Access your data from any device</li>
            <li>Export and download your data at any time</li>
            <li>Data retention as per our Privacy Policy</li>
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>9. Contact Information</CardTitle>
        </CardHeader>
        <CardContent className="prose prose-slate max-w-none">
          <p>
            For questions about service delivery or access issues, please contact us through our Contact Us page.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
