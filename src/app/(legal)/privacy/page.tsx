import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Shield } from 'lucide-react'

export const metadata = {
  title: 'Privacy Policy | ResumeAI',
  description: 'Privacy Policy for ResumeAI services',
}

export default function PrivacyPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 flex items-center justify-center">
          <Shield className="h-6 w-6 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Privacy Policy</h1>
          <p className="text-slate-500">Last updated: December 30, 2025</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>1. Information We Collect</CardTitle>
        </CardHeader>
        <CardContent className="prose prose-slate max-w-none">
          <p>We collect information necessary to provide our services, including:</p>
          <ul>
            <li>Account information (name, email, credentials)</li>
            <li>Resume and career data you provide</li>
            <li>Usage data for service improvement</li>
          </ul>
          <p>
            This information is used for service delivery, personalization, marketing communications, 
            and training our AI models to improve the platform.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>2. How We Use Your Information</CardTitle>
        </CardHeader>
        <CardContent className="prose prose-slate max-w-none">
          <p>We use the collected information to:</p>
          <ul>
            <li><strong>Provide Services:</strong> Generate AI-customized resumes, interview prep, and career guidance</li>
            <li><strong>Improve AI Models:</strong> Train and enhance our AI algorithms using anonymized data</li>
            <li><strong>Personalization:</strong> Tailor recommendations and content to your career goals</li>
            <li><strong>Communication:</strong> Send service updates, tips, and promotional content (with your consent)</li>
            <li><strong>Security:</strong> Detect and prevent fraud, abuse, and security incidents</li>
            <li><strong>Analytics:</strong> Understand usage patterns to improve our service</li>
            <li><strong>Legal Compliance:</strong> Comply with legal obligations and enforce our terms</li>
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>3. Data Storage and Security</CardTitle>
        </CardHeader>
        <CardContent className="prose prose-slate max-w-none">
          <p>We take data security seriously:</p>
          <ul>
            <li><strong>Encryption:</strong> All data is encrypted in transit and at rest</li>
            <li><strong>Secure Storage:</strong> Data is stored on secure cloud infrastructure</li>
            <li><strong>Access Controls:</strong> Strict access controls limit who can view your data</li>
            <li><strong>Regular Audits:</strong> We conduct regular security audits and updates</li>
            <li><strong>Backup:</strong> Regular backups ensure data availability and recovery</li>
          </ul>
          <p>
            However, no method of transmission over the Internet is 100% secure. While we strive to protect your data, 
            we cannot guarantee absolute security.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>4. Data Sharing and Disclosure</CardTitle>
        </CardHeader>
        <CardContent className="prose prose-slate max-w-none">
          <p>We do not sell your personal information. We may share data with:</p>
          
          <h3>Service Providers</h3>
          <ul>
            <li>AI service providers for resume customization</li>
            <li>Cloud hosting and infrastructure providers</li>
            <li>Analytics services to understand usage patterns</li>
            <li><strong>Payment Processors:</strong> We use Razorpay as our payment gateway. When you make a payment, your payment information (card details, billing address, transaction data) is shared with Razorpay for processing. By using our payment services, you consent to sharing this information with Razorpay in accordance with their privacy policy.</li>
          </ul>

          <h3>Legal Requirements</h3>
          <p>We may disclose information if required by law or to:</p>
          <ul>
            <li>Comply with legal processes or government requests</li>
            <li>Enforce our Terms and Conditions</li>
            <li>Protect our rights, privacy, safety, or property</li>
            <li>Prevent fraud or security issues</li>
          </ul>

          <h3>Business Transfers</h3>
          <p>
            In the event of a merger, acquisition, or sale of assets, your information may be transferred. 
            We will notify you of any such change.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>5. Your Data Rights</CardTitle>
        </CardHeader>
        <CardContent className="prose prose-slate max-w-none">
          <p>You have the right to:</p>
          <ul>
            <li><strong>Access:</strong> Request a copy of your personal data</li>
            <li><strong>Correction:</strong> Update or correct inaccurate information</li>
            <li><strong>Deletion:</strong> Request deletion of your account and data</li>
            <li><strong>Export:</strong> Download your resume and career data</li>
            <li><strong>Opt-out:</strong> Unsubscribe from marketing communications</li>
            <li><strong>Restrict Processing:</strong> Limit how we use your data</li>
            <li><strong>Data Portability:</strong> Transfer your data to another service</li>
          </ul>
          <p>To exercise these rights, contact us through our Contact Us page.</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>6. Cookies and Tracking</CardTitle>
        </CardHeader>
        <CardContent className="prose prose-slate max-w-none">
          <p>We use cookies and similar technologies to:</p>
          <ul>
            <li>Maintain your login session</li>
            <li>Remember your preferences</li>
            <li>Analyze site traffic and usage</li>
            <li>Improve user experience</li>
          </ul>
          <p>
            You can control cookies through your browser settings. However, disabling cookies may affect 
            the functionality of our Service.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>7. Third-Party Services</CardTitle>
        </CardHeader>
        <CardContent className="prose prose-slate max-w-none">
          <p>
            Our Service integrates with third-party services for AI processing, authentication, data storage, 
            and hosting. These services have their own privacy policies. We encourage you to review them. 
            We are not responsible for the privacy practices of third-party services.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>8. Children's Privacy</CardTitle>
        </CardHeader>
        <CardContent className="prose prose-slate max-w-none">
          <p>
            Our Service is not intended for users under 16 years of age. We do not knowingly collect 
            personal information from children. If you believe we have collected information from a child, 
            please contact us immediately.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>9. International Data Transfers</CardTitle>
        </CardHeader>
        <CardContent className="prose prose-slate max-w-none">
          <p>
            Your information may be transferred to and processed in countries other than your own. 
            We ensure appropriate safeguards are in place to protect your data in accordance with this 
            Privacy Policy and applicable laws.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>10. Data Retention</CardTitle>
        </CardHeader>
        <CardContent className="prose prose-slate max-w-none">
          <p>We retain your data:</p>
          <ul>
            <li>As long as your account is active</li>
            <li>As necessary to provide services</li>
            <li>To comply with legal obligations</li>
            <li>To resolve disputes and enforce agreements</li>
            <li><strong>Transaction Records:</strong> Payment and transaction records are retained for 10 years from the transaction date to comply with financial regulations and payment gateway requirements</li>
          </ul>
          <p>
            When you delete your account, we will delete or anonymize your personal data within 30 days, 
            except where we are required to retain it for legal purposes. Transaction records will be retained 
            for the full 10-year period as required by law and our payment processor's terms.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>11. Changes to Privacy Policy</CardTitle>
        </CardHeader>
        <CardContent className="prose prose-slate max-w-none">
          <p>
            We may update this Privacy Policy from time to time. We will notify you of significant changes 
            by email or through a notice on our Service. Your continued use after changes constitutes 
            acceptance of the updated policy.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>12. Contact Us</CardTitle>
        </CardHeader>
        <CardContent className="prose prose-slate max-w-none">
          <p>
            If you have questions about this Privacy Policy or our data practices, please contact us 
            through our Contact Us page.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
