'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { AlertCircle, Loader2, Crown, Calendar, CreditCard, AlertTriangle, ArrowLeft } from 'lucide-react'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import type { Database } from '@/types/database'

type Subscription = Database['public']['Tables']['subscriptions']['Row']

export default function ManageSubscriptionPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [showCancelDialog, setShowCancelDialog] = useState(false)
  const [cancelling, setCancelling] = useState(false)

  useEffect(() => {
    const fetchSubscription = async () => {
      setLoading(true)
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      
      if (user) {
        const { data: subscriptionData } = await supabase
          .from('subscriptions')
          .select('*')
          .eq('user_id', user.id)
          .in('status', ['active', 'authenticated'])
          .single()
        
        if (subscriptionData) {
          setSubscription(subscriptionData)
        }
      }
      setLoading(false)
    }
    fetchSubscription()
  }, [])

  const handleCancelSubscription = async () => {
    setCancelling(true)
    const supabase = createClient()
    
    try {
      // Cancel subscription in Razorpay
      const response = await fetch('/api/razorpay/cancel-subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subscriptionId: subscription?.razorpay_subscription_id,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to cancel subscription')
      }

      // Update subscription status in database
      if (!subscription?.id) {
        throw new Error('Subscription ID not found')
      }
      
      const { error } = await supabase
        .from('subscriptions')
        .update({ 
          status: 'cancelled',
          updated_at: new Date().toISOString(),
        })
        .eq('id', subscription.id)

      if (error) throw error

      toast.success('Subscription cancelled successfully')
      router.push('/settings')
    } catch (error) {
      console.error('Cancel subscription error:', error)
      toast.error('Failed to cancel subscription. Please contact support.')
    } finally {
      setCancelling(false)
      setShowCancelDialog(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6 max-w-2xl">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Manage Subscription</h1>
          <p className="text-muted-foreground mt-1">
            Manage your subscription and billing
          </p>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="text-center space-y-4">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
            <p className="text-sm text-muted-foreground">Loading subscription details...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!subscription) {
    return (
      <div className="space-y-6 max-w-2xl">
        <Button 
          variant="ghost" 
          onClick={() => router.push('/settings')}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Settings
        </Button>
        <Card>
          <CardContent className="text-center py-12">
            <AlertCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Active Subscription</h3>
            <p className="text-sm text-muted-foreground mb-6">
              You don't have an active subscription to manage.
            </p>
            <Button onClick={() => router.push('/pricing')}>
              View Plans
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const planName = subscription.plan_id.split('-')[1]?.toUpperCase() || 'PREMIUM'
  const billingCycle = subscription.billing_cycle === 'annual' ? 'Annual' : 'Monthly'
  const nextBillingDate = subscription.current_period_end 
    ? new Date(subscription.current_period_end).toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      })
    : 'N/A'

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-4">
        <Button 
          variant="ghost" 
          onClick={() => router.push('/settings')}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Manage Subscription</h1>
          <p className="text-muted-foreground mt-1">
            View and manage your subscription details
          </p>
        </div>
      </div>

      {/* Current Subscription Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Current Subscription</CardTitle>
            <Badge className="bg-gradient-to-r from-violet-600 to-indigo-600">
              <Crown className="h-3 w-3 mr-1" />
              {planName}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4">
            <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Billing Cycle</p>
                  <p className="text-sm text-muted-foreground">{billingCycle}</p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
              <div className="flex items-center gap-3">
                <CreditCard className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Next Billing Date</p>
                  <p className="text-sm text-muted-foreground">{nextBillingDate}</p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
              <div className="flex items-center gap-3">
                <Crown className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Status</p>
                  <p className="text-sm">
                    <span className="text-emerald-600 font-medium capitalize">{subscription.status}</span>
                  </p>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          <div className="space-y-3">
            <p className="text-sm font-medium">Subscription Actions</p>
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => router.push('/pricing')}
            >
              Change Plan
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Cancel Subscription Card */}
      <Card className="border-red-200">
        <CardHeader>
          <CardTitle className="text-red-600 flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Discontinue Subscription
          </CardTitle>
          <CardDescription>
            Cancel your subscription and stop future billing
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-sm text-red-800 mb-2">
              <strong>Important:</strong> Cancelling your subscription will:
            </p>
            <ul className="text-sm text-red-700 space-y-1 ml-4 list-disc">
              <li>Stop all future billing immediately</li>
              <li>Allow you to use features until the end of your current billing period</li>
              <li>Permanently delete your data 30 days after cancellation</li>
              <li>Require a new subscription to regain access</li>
            </ul>
          </div>

          <Button 
            variant="destructive" 
            className="w-full"
            onClick={() => setShowCancelDialog(true)}
            disabled={cancelling}
          >
            {cancelling ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Cancelling...
              </>
            ) : (
              'Cancel Subscription'
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Confirmation Dialog */}
      <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="h-5 w-5" />
              Are you absolutely sure?
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-3">
              <p>
                This action will cancel your <strong>{planName}</strong> subscription. 
                You will lose access to all premium features at the end of your current billing period.
              </p>
              <p className="text-red-600 font-medium">
                This action cannot be undone. You will need to create a new subscription to regain access.
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={cancelling}>Keep Subscription</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCancelSubscription}
              disabled={cancelling}
              className="bg-red-600 hover:bg-red-700"
            >
              {cancelling ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Cancelling...
                </>
              ) : (
                'Yes, Cancel Subscription'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
