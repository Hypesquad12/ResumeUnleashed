import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { RefreshCw } from 'lucide-react'

export const metadata = {
  title: 'Cancellation and Refunds | Resume Unleashed',
  description: 'Cancellation and Refunds Policy for Resume Unleashed services',
  robots: {
    index: true,
    follow: true,
  },
}

export default function RefundsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
          <RefreshCw className="h-6 w-6 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Cancellation and Refunds</h1>
          <p className="text-slate-500">Last updated: December 30, 2025</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>1. Cancellation Policy</CardTitle>
        </CardHeader>
        <CardContent className="prose prose-slate max-w-none">
          <h3>Free Account</h3>
          <p>You may cancel your free account at any time:</p>
          <ul>
            <li>Go to Settings → Account → Delete Account</li>
            <li>No fees or penalties apply</li>
            <li>Your data will be deleted within 30 days</li>
          </ul>

          <h3>Premium Subscription</h3>
          <p>You can cancel your premium subscription at any time:</p>
          <ul>
            <li>Navigate to Settings → Subscription → Cancel Subscription</li>
            <li>Cancellation takes effect at the end of your current billing period</li>
            <li>You retain access to premium features until the end of the paid period</li>
            <li>No refund for the remaining days of the current billing cycle</li>
            <li>You can reactivate your subscription anytime before it expires</li>
          </ul>

          <h3>One-Time Purchases</h3>
          <p>For one-time purchases (templates, premium features):</p>
          <ul>
            <li>Cancellation requests must be made within 14 days of purchase</li>
            <li>Refund eligibility depends on usage (see Refund Policy below)</li>
            <li>Contact us through the Contact Us page to request cancellation</li>
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>2. Refund Policy</CardTitle>
        </CardHeader>
        <CardContent className="prose prose-slate max-w-none">
          <h3>14-Day Money-Back Guarantee</h3>
          <p>We offer a 14-day money-back guarantee for:</p>
          <ul>
            <li>First-time premium subscription purchases</li>
            <li>One-time template or feature purchases</li>
          </ul>
          <p><strong>Conditions:</strong></p>
          <ul>
            <li>Request must be made within 14 days of purchase</li>
            <li>Limited usage of premium features (less than 5 AI customizations)</li>
            <li>No previous refunds on your account</li>
            <li>Valid reason for refund request</li>
          </ul>

          <h3>Subscription Refunds</h3>
          <p>Monthly Subscriptions:</p>
          <ul>
            <li>Full refund if cancelled within 48 hours of initial purchase</li>
            <li>No refund for subsequent monthly renewals</li>
            <li>Pro-rated refunds not available</li>
          </ul>
          <p>Annual Subscriptions:</p>
          <ul>
            <li>Full refund if cancelled within 14 days of purchase</li>
            <li>Pro-rated refund available for first 90 days (minus usage fees)</li>
            <li>No refunds after 90 days from purchase date</li>
          </ul>

          <h3>Non-Refundable Items</h3>
          <p>The following are not eligible for refunds:</p>
          <ul>
            <li>Subscription renewals (after the first billing cycle)</li>
            <li>Services already fully utilized (e.g., completed AI customizations)</li>
            <li>Downloaded templates or content</li>
            <li>Promotional or discounted purchases (unless required by law)</li>
            <li>Refunds previously granted on the same account</li>
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>3. How to Request a Refund</CardTitle>
        </CardHeader>
        <CardContent className="prose prose-slate max-w-none">
          <p>To request a refund:</p>
          <ol>
            <li>Contact us through the Contact Us page or email billing@resumeunleashed.com</li>
            <li>Include your account email and order/transaction ID</li>
            <li>Provide a reason for the refund request</li>
            <li>Allow 3-5 business days for review</li>
          </ol>
          <p><strong>Required Information:</strong></p>
          <ul>
            <li>Full name and account email</li>
            <li>Date of purchase</li>
            <li>Transaction ID or receipt</li>
            <li>Reason for refund</li>
            <li>Any relevant screenshots or documentation</li>
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>4. Refund Processing</CardTitle>
        </CardHeader>
        <CardContent className="prose prose-slate max-w-none">
          <h3>Review Process</h3>
          <p>Once we receive your refund request:</p>
          <ul>
            <li>We will review your request within 3-5 business days</li>
            <li>You will receive an email notification of approval or denial</li>
            <li>If approved, refund will be processed within 5-10 business days</li>
          </ul>

          <h3>Refund Method</h3>
          <p>Refunds are issued to the original payment method:</p>
          <ul>
            <li>Credit/Debit Card: 5-10 business days</li>
            <li>PayPal: 3-5 business days</li>
            <li>Bank Transfer: 7-14 business days</li>
          </ul>
          <p>
            Note: Processing times may vary depending on your financial institution. 
            We cannot expedite refunds once processed.
          </p>

          <h3>Partial Refunds</h3>
          <p>In some cases, we may offer partial refunds:</p>
          <ul>
            <li>Pro-rated refunds for annual subscriptions (within 90 days)</li>
            <li>Service credits instead of monetary refunds</li>
            <li>Refunds minus usage fees for heavily used services</li>
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>5. Subscription Management</CardTitle>
        </CardHeader>
        <CardContent className="prose prose-slate max-w-none">
          <h3>Auto-Renewal</h3>
          <p>Subscriptions automatically renew unless cancelled:</p>
          <ul>
            <li>Monthly subscriptions renew every 30 days</li>
            <li>Annual subscriptions renew every 365 days</li>
            <li>You will receive a reminder email 7 days before renewal</li>
            <li>Cancel anytime before renewal date to avoid charges</li>
          </ul>

          <h3>Downgrading</h3>
          <p>You can downgrade your subscription:</p>
          <ul>
            <li>Downgrade takes effect at the end of current billing period</li>
            <li>No refund for the difference in subscription tiers</li>
            <li>You keep premium features until downgrade is effective</li>
          </ul>

          <h3>Upgrading</h3>
          <p>You can upgrade your subscription anytime:</p>
          <ul>
            <li>Upgrade is effective immediately</li>
            <li>Pro-rated credit applied for remaining time on current plan</li>
            <li>New billing cycle starts from upgrade date</li>
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>6. Failed Payments</CardTitle>
        </CardHeader>
        <CardContent className="prose prose-slate max-w-none">
          <p>If a subscription payment fails:</p>
          <ul>
            <li>We will attempt to charge your card 3 times over 10 days</li>
            <li>You will receive email notifications for each failed attempt</li>
            <li>Update your payment method in Settings to avoid service interruption</li>
            <li>After 3 failed attempts, your subscription will be cancelled</li>
            <li>You can reactivate by updating payment information</li>
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>7. Chargebacks and Disputes</CardTitle>
        </CardHeader>
        <CardContent className="prose prose-slate max-w-none">
          <p>
            <strong>Please contact us before initiating a chargeback.</strong> We're committed to resolving 
            any issues directly with you.
          </p>
          
          <h3>Chargeback Process</h3>
          <p>If you initiate a chargeback:</p>
          <ul>
            <li>Your account will be immediately suspended pending investigation</li>
            <li>We will provide evidence to your bank/card issuer through Razorpay</li>
            <li>If chargeback is ruled in your favor, your account will be closed</li>
            <li>If ruled in our favor, you will be responsible for chargeback fees (typically ₹500-₹1000)</li>
            <li>Fraudulent chargebacks may result in legal action</li>
          </ul>
          
          <h3>Payment Gateway Disputes</h3>
          <p>All payment disputes are handled through Razorpay in accordance with:</p>
          <ul>
            <li>Card Network Rules (Visa, Mastercard, RuPay, etc.)</li>
            <li>Reserve Bank of India (RBI) guidelines</li>
            <li>Payment and Settlement Systems Act, 2007</li>
          </ul>
          
          <h3>Dispute Resolution Timeline</h3>
          <ul>
            <li><strong>Initial Review:</strong> 3-5 business days</li>
            <li><strong>Evidence Submission:</strong> 7-10 business days</li>
            <li><strong>Card Network Decision:</strong> 30-90 days</li>
          </ul>
          
          <p>
            We maintain all transaction records for 10 years to facilitate dispute resolution and comply 
            with regulatory requirements.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>8. Service Interruptions</CardTitle>
        </CardHeader>
        <CardContent className="prose prose-slate max-w-none">
          <p>In case of service outages or technical issues:</p>
          <ul>
            <li>We will extend your subscription by the duration of the outage (if over 24 hours)</li>
            <li>Service credits may be issued for significant disruptions</li>
            <li>No refunds for minor, temporary service interruptions</li>
            <li>Scheduled maintenance is not considered service interruption</li>
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>9. Account Termination by Resume Unleashed</CardTitle>
        </CardHeader>
        <CardContent className="prose prose-slate max-w-none">
          <p>We reserve the right to terminate accounts for:</p>
          <ul>
            <li>Violation of Terms and Conditions</li>
            <li>Fraudulent activity or payment disputes</li>
            <li>Abuse of service or resources</li>
            <li>Illegal activities</li>
          </ul>
          <p>
            In case of termination for policy violations, no refunds will be issued. 
            For terminations due to our error, full refunds will be provided.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>10. Exceptions and Special Cases</CardTitle>
        </CardHeader>
        <CardContent className="prose prose-slate max-w-none">
          <p>We may make exceptions to this policy in cases of:</p>
          <ul>
            <li>Technical errors preventing service use</li>
            <li>Billing errors or duplicate charges</li>
            <li>Unauthorized account access</li>
            <li>Medical or emergency situations (documentation required)</li>
          </ul>
          <p>Each case is reviewed individually. Contact us to discuss your situation.</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>11. Legal Rights</CardTitle>
        </CardHeader>
        <CardContent className="prose prose-slate max-w-none">
          <p>
            This policy does not affect your statutory rights. Some jurisdictions do not allow limitations 
            on refunds for digital services. If you reside in such a jurisdiction, some limitations may not apply to you.
          </p>
          <p>
            For EU customers: You have the right to withdraw from a purchase within 14 days without giving a reason, 
            in accordance with EU Consumer Rights Directive.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>12. Contact for Cancellations and Refunds</CardTitle>
        </CardHeader>
        <CardContent className="prose prose-slate max-w-none">
          <p>For cancellation or refund requests:</p>
          <ul>
            <li><strong>Email:</strong> billing@resumeunleashed.com</li>
            <li><strong>Contact Form:</strong> Use our Contact Us page</li>
            <li><strong>Response Time:</strong> Within 3-5 business days</li>
          </ul>
          <p>
            Please include all relevant information to expedite your request.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
