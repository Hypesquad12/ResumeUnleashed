'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Loader2, User, Crown, CreditCard, ExternalLink } from 'lucide-react'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import type { Database } from '@/types/database'

type Profile = Database['public']['Tables']['profiles']['Row']
type Subscription = Database['public']['Tables']['subscriptions']['Row']

export default function SettingsPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [fullName, setFullName] = useState('')

  useEffect(() => {
    const fetchData = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      
      if (user) {
        // Fetch profile
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()
        
        if (profileData) {
          setProfile(profileData)
          setFullName(profileData.full_name || '')
        }

        // Fetch subscription
        const { data: subscriptionData } = await supabase
          .from('subscriptions')
          .select('*')
          .eq('user_id', user.id)
          .eq('status', 'active')
          .single()
        
        if (subscriptionData) {
          setSubscription(subscriptionData)
        }
      }
    }
    fetchData()
  }, [])

  const handleUpdateProfile = async () => {
    if (!profile) return
    
    setLoading(true)
    const supabase = createClient()
    
    const { error } = await supabase
      .from('profiles')
      .update({ full_name: fullName, updated_at: new Date().toISOString() })
      .eq('id', profile.id)

    if (error) {
      toast.error('Failed to update profile')
    } else {
      toast.success('Profile updated successfully')
    }
    setLoading(false)
  }

  const initials = profile?.full_name
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase() || 'U'

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground mt-1">
          Manage your account settings and preferences
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <CardDescription>Your personal information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center gap-4">
            <Avatar className="h-20 w-20">
              <AvatarImage src={profile?.avatar_url || ''} />
              <AvatarFallback className="text-lg">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div>
              <Button variant="outline" size="sm">Change Avatar</Button>
              <p className="text-xs text-muted-foreground mt-1">JPG, PNG. Max 2MB</p>
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Your name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                value={profile?.email || ''}
                disabled
                className="bg-muted"
              />
              <p className="text-xs text-muted-foreground">
                Email cannot be changed
              </p>
            </div>
          </div>

          <Button onClick={handleUpdateProfile} disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              'Save Changes'
            )}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Subscription</CardTitle>
              <CardDescription>Manage your subscription plan</CardDescription>
            </div>
            {subscription && (
              <Badge variant="default" className="bg-gradient-to-r from-violet-600 to-indigo-600">
                <Crown className="h-3 w-3 mr-1" />
                {subscription.plan_id.split('-')[1]?.toUpperCase() || 'PREMIUM'}
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {subscription ? (
            <>
              <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                <div className="space-y-1">
                  <p className="font-medium">Current Plan</p>
                  <p className="text-sm text-muted-foreground capitalize">
                    {subscription.plan_id.split('-')[1] || 'Premium'} - {subscription.billing_cycle}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Status: <span className="text-emerald-600 font-medium">{subscription.status}</span>
                  </p>
                  {subscription.current_period_end && (
                    <p className="text-xs text-muted-foreground">
                      Renews: {new Date(subscription.current_period_end).toLocaleDateString()}
                    </p>
                  )}
                </div>
                <CreditCard className="h-8 w-8 text-muted-foreground" />
              </div>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => router.push('/pricing')}
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Change Plan
                </Button>
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => toast.info('Cancellation feature coming soon')}
                >
                  Cancel Subscription
                </Button>
              </div>
            </>
          ) : (
            <div className="text-center py-6">
              <Crown className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
              <p className="font-medium mb-2">No Active Subscription</p>
              <p className="text-sm text-muted-foreground mb-4">
                Upgrade to unlock premium features
              </p>
              <Button 
                onClick={() => router.push('/pricing')}
                className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700"
              >
                <Crown className="h-4 w-4 mr-2" />
                View Plans
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Account</CardTitle>
          <CardDescription>Manage your account settings</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Change Password</p>
              <p className="text-sm text-muted-foreground">Update your password</p>
            </div>
            <Button variant="outline">Change</Button>
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-destructive">Delete Account</p>
              <p className="text-sm text-muted-foreground">Permanently delete your account and data</p>
            </div>
            <Button variant="destructive">Delete</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
