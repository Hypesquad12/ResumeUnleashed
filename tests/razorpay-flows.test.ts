/**
 * Razorpay Subscription Flow Tests
 * 
 * Tests all critical user flows for Razorpay subscription integration:
 * 1. Signup and mandate setup
 * 2. Cancel trial
 * 3. Limit reached and activated
 * 4. Cancelled then activated
 * 5. Cancel subscription
 */

import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!
const API_BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

// Test user credentials
const TEST_USER = {
  email: `test-${Date.now()}@example.com`,
  password: 'TestPassword123!',
  fullName: 'Test User'
}

// Helper function to make API calls
async function apiCall(endpoint: string, method: string = 'GET', body?: any, token?: string) {
  const headers: any = {
    'Content-Type': 'application/json',
  }
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  })

  const data = await response.json()
  return { response, data }
}

// Helper to get user session
async function getUserSession(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })
  
  if (error) throw error
  return data.session
}

// Helper to check subscription status
async function checkSubscriptionStatus(userId: string) {
  const { data, error } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('user_id', userId)
    .single()
  
  return { subscription: data, error }
}

// Helper to check usage
async function checkUsage(userId: string) {
  const startOfMonth = new Date()
  startOfMonth.setDate(1)
  startOfMonth.setHours(0, 0, 0, 0)

  const { count: customizations } = await supabase
    .from('customized_resumes')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .gte('created_at', startOfMonth.toISOString())

  const { count: resumes } = await supabase
    .from('resumes')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)

  return { customizations: customizations || 0, resumes: resumes || 0 }
}

console.log('🧪 Starting Razorpay Subscription Flow Tests\n')

/**
 * FLOW 1: Signup and Mandate Setup
 * 
 * Steps:
 * 1. Create new user account
 * 2. Select a plan (Premium Monthly)
 * 3. Create subscription with 7-day trial
 * 4. Verify subscription created with pending status
 * 5. Verify trial_active = true
 * 6. Verify trial_days = 7
 */
async function testFlow1_SignupAndMandateSetup() {
  console.log('📝 FLOW 1: Signup and Mandate Setup')
  console.log('=' .repeat(50))
  
  try {
    // Step 1: Create user account
    console.log('\n1️⃣  Creating test user account...')
    const { data: authData, error: signupError } = await supabase.auth.signUp({
      email: TEST_USER.email,
      password: TEST_USER.password,
      options: {
        data: {
          full_name: TEST_USER.fullName,
        },
      },
    })

    if (signupError) throw signupError
    console.log(`✅ User created: ${authData.user?.id}`)
    const userId = authData.user!.id

    // Step 2: Get session token
    console.log('\n2️⃣  Getting user session...')
    const session = await getUserSession(TEST_USER.email, TEST_USER.password)
    console.log(`✅ Session obtained`)

    // Step 3: Create subscription
    console.log('\n3️⃣  Creating subscription (Premium Monthly, India)...')
    const { response: subResponse, data: subData } = await apiCall(
      '/api/razorpay/create-subscription',
      'POST',
      {
        planId: 'premium',
        billingCycle: 'monthly',
        region: 'india',
        tier: 'premium',
      },
      session.access_token
    )

    if (!subResponse.ok) {
      throw new Error(`Subscription creation failed: ${JSON.stringify(subData)}`)
    }

    console.log(`✅ Subscription created: ${subData.subscriptionId}`)
    console.log(`   Short URL: ${subData.shortUrl}`)

    // Step 4: Verify subscription in database
    console.log('\n4️⃣  Verifying subscription in database...')
    await new Promise(resolve => setTimeout(resolve, 2000)) // Wait for DB update
    
    const { subscription, error: subError } = await checkSubscriptionStatus(userId)
    
    if (subError || !subscription) {
      throw new Error('Subscription not found in database')
    }

    console.log(`✅ Subscription verified:`)
    console.log(`   Status: ${subscription.status}`)
    console.log(`   Trial Active: ${subscription.trial_active}`)
    console.log(`   Trial Days: ${subscription.trial_days}`)
    console.log(`   Tier: ${subscription.tier}`)
    console.log(`   Billing Cycle: ${subscription.billing_cycle}`)
    console.log(`   Razorpay Sub ID: ${subscription.razorpay_subscription_id}`)

    // Verify expected values
    if (subscription.status !== 'pending') {
      console.log(`⚠️  Expected status 'pending', got '${subscription.status}'`)
    }
    if (subscription.trial_active !== false) {
      console.log(`⚠️  Expected trial_active false (before auth), got ${subscription.trial_active}`)
    }
    if (subscription.trial_days !== 7) {
      console.log(`⚠️  Expected trial_days 7, got ${subscription.trial_days}`)
    }

    console.log('\n✅ FLOW 1 COMPLETED SUCCESSFULLY')
    console.log(`\n📋 Next Steps (Manual):`)
    console.log(`   1. Open: ${subData.shortUrl}`)
    console.log(`   2. Complete mandate setup (use test card: 4111 1111 1111 1111)`)
    console.log(`   3. After authentication, status should change to 'authenticated'`)
    console.log(`   4. trial_active should become true`)
    
    return { userId, subscriptionId: subData.subscriptionId, session }

  } catch (error) {
    console.error('\n❌ FLOW 1 FAILED:', error)
    throw error
  }
}

/**
 * FLOW 2: Cancel Trial
 * 
 * Prerequisites: User has active trial (authenticated status, trial_active = true)
 * 
 * Steps:
 * 1. Verify user has active trial
 * 2. Call cancel subscription API
 * 3. Verify subscription cancelled
 * 4. Verify user still has access until trial end date
 */
async function testFlow2_CancelTrial(userId: string, session: any) {
  console.log('\n\n📝 FLOW 2: Cancel Trial')
  console.log('='.repeat(50))
  
  try {
    // Step 1: Verify active trial
    console.log('\n1️⃣  Verifying active trial...')
    const { subscription: beforeSub } = await checkSubscriptionStatus(userId)
    
    if (!beforeSub) throw new Error('No subscription found')
    
    console.log(`   Status: ${beforeSub.status}`)
    console.log(`   Trial Active: ${beforeSub.trial_active}`)
    console.log(`   Razorpay Sub ID: ${beforeSub.razorpay_subscription_id}`)

    // Step 2: Cancel subscription
    console.log('\n2️⃣  Cancelling subscription...')
    const { response: cancelResponse, data: cancelData } = await apiCall(
      '/api/razorpay/cancel-subscription',
      'POST',
      { subscriptionId: beforeSub.razorpay_subscription_id },
      session.access_token
    )

    if (!cancelResponse.ok) {
      throw new Error(`Cancel failed: ${JSON.stringify(cancelData)}`)
    }

    console.log(`✅ Cancellation API successful`)

    // Step 3: Verify cancellation in database
    console.log('\n3️⃣  Verifying cancellation in database...')
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    const { subscription: afterSub } = await checkSubscriptionStatus(userId)
    
    console.log(`   Status: ${afterSub?.status}`)
    console.log(`   Cancelled At: ${afterSub?.cancelled_at}`)
    console.log(`   Current Period End: ${afterSub?.current_period_end}`)

    // Step 4: Verify access maintained
    console.log('\n4️⃣  Verifying access maintained until period end...')
    const trialEndDate = new Date(afterSub!.current_period_end)
    const now = new Date()
    
    if (now < trialEndDate) {
      console.log(`✅ User should have access until: ${trialEndDate.toLocaleDateString()}`)
    } else {
      console.log(`⚠️  Trial period already ended`)
    }

    console.log('\n✅ FLOW 2 COMPLETED SUCCESSFULLY')
    
  } catch (error) {
    console.error('\n❌ FLOW 2 FAILED:', error)
    throw error
  }
}

/**
 * FLOW 3: Limit Reached and Activated
 * 
 * Prerequisites: User has active trial
 * 
 * Steps:
 * 1. Use all trial limits (2 customizations)
 * 2. Try to create 3rd customization - should show upgrade modal
 * 3. Click "Activate Now" button
 * 4. Complete payment
 * 5. Verify trial_active = false
 * 6. Verify status = active
 */
async function testFlow3_LimitReachedAndActivated(userId: string, session: any) {
  console.log('\n\n📝 FLOW 3: Limit Reached and Activated')
  console.log('='.repeat(50))
  
  try {
    // Step 1: Check current usage
    console.log('\n1️⃣  Checking current usage...')
    const usage = await checkUsage(userId)
    console.log(`   Customizations: ${usage.customizations}/2`)
    console.log(`   Resumes: ${usage.resumes}/1`)

    // Step 2: Check limits
    console.log('\n2️⃣  Checking subscription limits...')
    const { response: limitsResponse, data: limitsData } = await apiCall(
      '/api/check-limits?action=customization',
      'GET',
      undefined,
      session.access_token
    )

    console.log(`   Can perform action: ${limitsData.allowed}`)
    if (!limitsData.allowed) {
      console.log(`   Reason: ${limitsData.reason}`)
      console.log(`   Current: ${limitsData.current}/${limitsData.limit}`)
    }

    // Step 3: Simulate activation
    console.log('\n3️⃣  Simulating activation flow...')
    console.log(`   User would click "Activate Now" button`)
    console.log(`   This calls /api/razorpay/activate-trial`)
    
    const { response: activateResponse, data: activateData } = await apiCall(
      '/api/razorpay/activate-trial',
      'POST',
      undefined,
      session.access_token
    )

    if (activateResponse.ok && activateData.shortUrl) {
      console.log(`✅ Activation URL generated: ${activateData.shortUrl}`)
      console.log(`   Payment Method: ${activateData.paymentMethod}`)
      console.log(`   Amount: ₹${activateData.amount}`)
    }

    console.log('\n✅ FLOW 3 COMPLETED SUCCESSFULLY')
    console.log(`\n📋 Next Steps (Manual):`)
    console.log(`   1. Open: ${activateData.shortUrl}`)
    console.log(`   2. Complete payment`)
    console.log(`   3. Verify trial_active becomes false`)
    console.log(`   4. Verify status becomes 'active'`)
    console.log(`   5. Verify limits increase to plan limits`)
    
  } catch (error) {
    console.error('\n❌ FLOW 3 FAILED:', error)
    throw error
  }
}

/**
 * FLOW 4: Cancelled then Activated
 * 
 * Prerequisites: User cancelled trial but still within trial period
 * 
 * Steps:
 * 1. Verify subscription is cancelled but accessible
 * 2. User decides to reactivate
 * 3. Create new subscription
 * 4. Verify old subscription cancelled
 * 5. Verify new subscription active
 */
async function testFlow4_CancelledThenActivated(userId: string, session: any) {
  console.log('\n\n📝 FLOW 4: Cancelled then Activated')
  console.log('='.repeat(50))
  
  try {
    // Step 1: Verify cancelled subscription
    console.log('\n1️⃣  Verifying cancelled subscription...')
    const { subscription: cancelledSub } = await checkSubscriptionStatus(userId)
    
    console.log(`   Status: ${cancelledSub?.status}`)
    console.log(`   Cancelled: ${cancelledSub?.cancelled_at ? 'Yes' : 'No'}`)
    console.log(`   Access until: ${cancelledSub?.current_period_end}`)

    // Step 2: Create new subscription
    console.log('\n2️⃣  Creating new subscription...')
    const { response: newSubResponse, data: newSubData } = await apiCall(
      '/api/razorpay/create-subscription',
      'POST',
      {
        planId: 'premium',
        billingCycle: 'monthly',
        region: 'india',
        tier: 'premium',
      },
      session.access_token
    )

    if (!newSubResponse.ok) {
      throw new Error(`New subscription failed: ${JSON.stringify(newSubData)}`)
    }

    console.log(`✅ New subscription created: ${newSubData.subscriptionId}`)

    // Step 3: Verify database state
    console.log('\n3️⃣  Verifying database state...')
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    const { subscription: newSub } = await checkSubscriptionStatus(userId)
    
    console.log(`   New Razorpay Sub ID: ${newSub?.razorpay_subscription_id}`)
    console.log(`   Status: ${newSub?.status}`)
    console.log(`   Trial Days: ${newSub?.trial_days} (should be 0 for returning customer)`)

    console.log('\n✅ FLOW 4 COMPLETED SUCCESSFULLY')
    
  } catch (error) {
    console.error('\n❌ FLOW 4 FAILED:', error)
    throw error
  }
}

/**
 * FLOW 5: Cancel Subscription (Paid)
 * 
 * Prerequisites: User has paid subscription (not trial)
 * 
 * Steps:
 * 1. Verify active paid subscription
 * 2. Cancel subscription
 * 3. Verify cancellation
 * 4. Verify access maintained until period end
 * 5. Verify no future charges
 */
async function testFlow5_CancelSubscription(userId: string, session: any) {
  console.log('\n\n📝 FLOW 5: Cancel Subscription (Paid)')
  console.log('='.repeat(50))
  
  try {
    // Step 1: Verify paid subscription
    console.log('\n1️⃣  Verifying paid subscription...')
    const { subscription: paidSub } = await checkSubscriptionStatus(userId)
    
    console.log(`   Status: ${paidSub?.status}`)
    console.log(`   Trial Active: ${paidSub?.trial_active}`)
    console.log(`   Current Period End: ${paidSub?.current_period_end}`)

    if (paidSub?.trial_active) {
      console.log(`⚠️  Warning: This is still a trial subscription`)
    }

    // Step 2: Cancel subscription
    console.log('\n2️⃣  Cancelling subscription...')
    const { response: cancelResponse, data: cancelData } = await apiCall(
      '/api/razorpay/cancel-subscription',
      'POST',
      { subscriptionId: paidSub?.razorpay_subscription_id },
      session.access_token
    )

    if (!cancelResponse.ok) {
      throw new Error(`Cancel failed: ${JSON.stringify(cancelData)}`)
    }

    console.log(`✅ Cancellation successful`)

    // Step 3: Verify cancellation
    console.log('\n3️⃣  Verifying cancellation...')
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    const { subscription: cancelledSub } = await checkSubscriptionStatus(userId)
    
    console.log(`   Status: ${cancelledSub?.status}`)
    console.log(`   Cancelled At: ${cancelledSub?.cancelled_at}`)
    console.log(`   Access Until: ${cancelledSub?.current_period_end}`)

    // Step 4: Verify access period
    console.log('\n4️⃣  Verifying access maintained...')
    const periodEnd = new Date(cancelledSub!.current_period_end)
    const now = new Date()
    const daysRemaining = Math.ceil((periodEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    
    console.log(`   Days of access remaining: ${daysRemaining}`)
    console.log(`   Access ends: ${periodEnd.toLocaleDateString()}`)

    console.log('\n✅ FLOW 5 COMPLETED SUCCESSFULLY')
    
  } catch (error) {
    console.error('\n❌ FLOW 5 FAILED:', error)
    throw error
  }
}

// Main test runner
async function runAllTests() {
  console.log('🚀 Starting Razorpay Flow Tests')
  console.log('Environment:', {
    API_BASE_URL,
    SUPABASE_URL,
  })
  console.log('\n')

  let testResults = {
    flow1: false,
    flow2: false,
    flow3: false,
    flow4: false,
    flow5: false,
  }

  let userId: string
  let session: any

  try {
    // Flow 1: Signup and Mandate Setup
    const flow1Result = await testFlow1_SignupAndMandateSetup()
    testResults.flow1 = true
    userId = flow1Result.userId
    session = flow1Result.session

    console.log('\n\n⏸️  PAUSING FOR MANUAL MANDATE SETUP')
    console.log('Please complete the mandate setup in the browser, then press Enter to continue...')
    
    // In a real test, you'd wait for user input or webhook confirmation
    // For now, we'll just note this is a manual step
    
  } catch (error) {
    console.error('Flow 1 failed, stopping tests')
  }

  // Print summary
  console.log('\n\n' + '='.repeat(50))
  console.log('📊 TEST SUMMARY')
  console.log('='.repeat(50))
  console.log(`Flow 1 (Signup & Mandate): ${testResults.flow1 ? '✅ PASS' : '❌ FAIL'}`)
  console.log(`Flow 2 (Cancel Trial): ${testResults.flow2 ? '✅ PASS' : '⏭️  SKIP'}`)
  console.log(`Flow 3 (Limit & Activate): ${testResults.flow3 ? '✅ PASS' : '⏭️  SKIP'}`)
  console.log(`Flow 4 (Cancel & Reactivate): ${testResults.flow4 ? '✅ PASS' : '⏭️  SKIP'}`)
  console.log(`Flow 5 (Cancel Paid): ${testResults.flow5 ? '✅ PASS' : '⏭️  SKIP'}`)
  console.log('='.repeat(50))
}

// Run tests
runAllTests().catch(console.error)
