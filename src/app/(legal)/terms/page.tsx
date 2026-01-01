import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { FileText } from 'lucide-react'

export const metadata = {
  title: 'Terms and Conditions | ResumeAI',
  description: 'Terms and Conditions for using ResumeAI services',
}

export default function TermsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-violet-500 to-indigo-500 flex items-center justify-center">
          <FileText className="h-6 w-6 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Terms and Conditions</h1>
          <p className="text-slate-500">Last updated: December 30, 2025</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>1. Acceptance of Terms</CardTitle>
        </CardHeader>
        <CardContent className="prose prose-slate max-w-none">
          <p>
            By accessing and using ResumeAI ("the Service"), you accept and agree to be bound by the terms and provision of this agreement. 
            If you do not agree to these Terms and Conditions, please do not use our Service.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>2. Use License</CardTitle>
        </CardHeader>
        <CardContent className="prose prose-slate max-w-none">
          <p>Permission is granted to temporarily access the Service for personal, non-commercial use only. This includes:</p>
          <ul>
            <li>Creating and customizing resumes using our AI-powered tools</li>
            <li>Accessing interview preparation features</li>
            <li>Using salary negotiation guides</li>
            <li>Creating digital visiting cards</li>
          </ul>
          <p>This license shall automatically terminate if you violate any of these restrictions.</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>3. User Accounts</CardTitle>
        </CardHeader>
        <CardContent className="prose prose-slate max-w-none">
          <p>When you create an account with us, you must provide accurate, complete, and current information. You are responsible for:</p>
          <ul>
            <li>Maintaining the confidentiality of your account credentials</li>
            <li>All activities that occur under your account</li>
            <li>Notifying us immediately of any unauthorized use</li>
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>4. AI-Generated Content</CardTitle>
        </CardHeader>
        <CardContent className="prose prose-slate max-w-none">
          <p>
            Our Service uses artificial intelligence to customize resumes and provide career guidance. While we strive for accuracy:
          </p>
          <ul>
            <li>AI-generated content should be reviewed and verified by users</li>
            <li>We do not guarantee the accuracy or completeness of AI suggestions</li>
            <li>Users are responsible for the final content of their resumes</li>
            <li>Salary estimates are based on market data and should be used as guidelines only</li>
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>5. Intellectual Property</CardTitle>
        </CardHeader>
        <CardContent className="prose prose-slate max-w-none">
          <p>
            The Service and its original content, features, and functionality are owned by ResumeAI and are protected by international copyright, 
            trademark, patent, trade secret, and other intellectual property laws.
          </p>
          <p>Your resume content remains your property. By using our Service, you grant us a license to:</p>
          <ul>
            <li>Process and store your data to provide the Service</li>
            <li>Use anonymized data to improve our AI models</li>
            <li>Display your content as necessary to provide the Service</li>
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>6. Prohibited Uses</CardTitle>
        </CardHeader>
        <CardContent className="prose prose-slate max-w-none">
          <p>You agree not to use the Service:</p>
          <ul>
            <li>For any unlawful purpose or to solicit others to perform unlawful acts</li>
            <li>To violate any international, federal, provincial, or state regulations, rules, laws, or local ordinances</li>
            <li>To infringe upon or violate our intellectual property rights or the intellectual property rights of others</li>
            <li>To harass, abuse, insult, harm, defame, slander, disparage, intimidate, or discriminate</li>
            <li>To submit false or misleading information</li>
            <li>To upload or transmit viruses or any other type of malicious code</li>
            <li>To spam, phish, pharm, pretext, spider, crawl, or scrape</li>
            <li>To interfere with or circumvent the security features of the Service</li>
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>7. Payment Terms</CardTitle>
        </CardHeader>
        <CardContent className="prose prose-slate max-w-none">
          <p>
            If you purchase any premium features or services:
          </p>
          <ul>
            <li>All fees are in INR (Indian Rupees) unless otherwise stated</li>
            <li>Payment is required upfront for subscription services</li>
            <li>Subscriptions automatically renew unless cancelled</li>
            <li>Refunds are subject to our Cancellation and Refunds policy</li>
          </ul>
          
          <h3>Payment Gateway</h3>
          <p>
            We use <strong>Razorpay</strong> as our payment gateway provider. By making a payment through our Service:
          </p>
          <ul>
            <li>You agree to Razorpay's Terms and Conditions</li>
            <li>Your payment information is processed securely by Razorpay</li>
            <li>We do not store your complete card details on our servers</li>
            <li>Payment disputes and chargebacks are handled in accordance with Razorpay's policies and card network rules</li>
            <li>You authorize us to share your transaction data with Razorpay for payment processing</li>
          </ul>
          
          <h3>Transaction Records</h3>
          <p>
            We maintain transaction records for 10 years as required by financial regulations and payment gateway compliance requirements.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>8. Disclaimer</CardTitle>
        </CardHeader>
        <CardContent className="prose prose-slate max-w-none">
          <p>
            The Service is provided on an "AS IS" and "AS AVAILABLE" basis. We make no warranties, expressed or implied, and hereby disclaim 
            all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular 
            purpose, or non-infringement of intellectual property.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>9. Limitation of Liability</CardTitle>
        </CardHeader>
        <CardContent className="prose prose-slate max-w-none">
          <p>
            In no event shall ResumeAI, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, 
            incidental, special, consequential, or punitive damages, including without limitation, loss of profits, data, use, goodwill, or 
            other intangible losses, resulting from your access to or use of or inability to access or use the Service.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>10. Changes to Terms</CardTitle>
        </CardHeader>
        <CardContent className="prose prose-slate max-w-none">
          <p>
            We reserve the right to modify or replace these Terms at any time. If a revision is material, we will provide at least 30 days' 
            notice prior to any new terms taking effect. What constitutes a material change will be determined at our sole discretion.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>11. Contact Information</CardTitle>
        </CardHeader>
        <CardContent className="prose prose-slate max-w-none">
          <p>
            If you have any questions about these Terms, please contact us through our Contact Us page.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
