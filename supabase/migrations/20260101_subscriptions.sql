-- Create subscription plans table
CREATE TABLE IF NOT EXISTS subscription_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  tier TEXT NOT NULL CHECK (tier IN ('free', 'professional', 'premium', 'ultimate')),
  region TEXT NOT NULL CHECK (region IN ('india', 'row')),
  currency TEXT NOT NULL,
  price_monthly DECIMAL(10, 2) NOT NULL,
  price_annual DECIMAL(10, 2) NOT NULL,
  features JSONB NOT NULL,
  limits JSONB NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create subscriptions table
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_id UUID NOT NULL REFERENCES subscription_plans(id),
  razorpay_subscription_id TEXT,
  razorpay_customer_id TEXT,
  status TEXT NOT NULL CHECK (status IN ('active', 'cancelled', 'expired', 'paused', 'pending')),
  billing_cycle TEXT NOT NULL CHECK (billing_cycle IN ('monthly', 'annual')),
  current_period_start TIMESTAMPTZ NOT NULL,
  current_period_end TIMESTAMPTZ NOT NULL,
  cancel_at_period_end BOOLEAN DEFAULT false,
  cancelled_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Create payment transactions table
CREATE TABLE IF NOT EXISTS payment_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subscription_id UUID REFERENCES subscriptions(id) ON DELETE SET NULL,
  razorpay_payment_id TEXT UNIQUE,
  razorpay_order_id TEXT,
  amount DECIMAL(10, 2) NOT NULL,
  currency TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('created', 'authorized', 'captured', 'refunded', 'failed')),
  payment_method TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create usage tracking table
CREATE TABLE IF NOT EXISTS usage_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subscription_id UUID REFERENCES subscriptions(id) ON DELETE SET NULL,
  feature_type TEXT NOT NULL CHECK (feature_type IN ('ai_customization', 'interview_prep', 'job_matching', 'cover_letter')),
  usage_count INTEGER DEFAULT 0,
  period_start TIMESTAMPTZ NOT NULL,
  period_end TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, feature_type, period_start)
);

-- Create indexes
CREATE INDEX idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);
CREATE INDEX idx_subscriptions_razorpay_subscription_id ON subscriptions(razorpay_subscription_id);
CREATE INDEX idx_payment_transactions_user_id ON payment_transactions(user_id);
CREATE INDEX idx_payment_transactions_razorpay_payment_id ON payment_transactions(razorpay_payment_id);
CREATE INDEX idx_usage_tracking_user_id ON usage_tracking(user_id);
CREATE INDEX idx_usage_tracking_period ON usage_tracking(period_start, period_end);

-- Enable RLS
ALTER TABLE subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_tracking ENABLE ROW LEVEL SECURITY;

-- RLS Policies for subscription_plans (public read)
CREATE POLICY "Anyone can view active subscription plans"
  ON subscription_plans FOR SELECT
  USING (is_active = true);

-- RLS Policies for subscriptions
CREATE POLICY "Users can view their own subscriptions"
  ON subscriptions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own subscriptions"
  ON subscriptions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own subscriptions"
  ON subscriptions FOR UPDATE
  USING (auth.uid() = user_id);

-- RLS Policies for payment_transactions
CREATE POLICY "Users can view their own payment transactions"
  ON payment_transactions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own payment transactions"
  ON payment_transactions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for usage_tracking
CREATE POLICY "Users can view their own usage"
  ON usage_tracking FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own usage"
  ON usage_tracking FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own usage"
  ON usage_tracking FOR UPDATE
  USING (auth.uid() = user_id);

-- Insert subscription plans for India
INSERT INTO subscription_plans (name, tier, region, currency, price_monthly, price_annual, features, limits) VALUES
('Starter', 'free', 'india', 'INR', 0, 0, 
  '{"templates": 1, "ai_customization": false, "downloads": "pdf_watermark", "support": "email_72hr"}',
  '{"resumes": 1, "customizations": 0, "interviews": 0, "job_matching": 0}'
),
('Professional', 'professional', 'india', 'INR', 499, 4491,
  '{"templates": 10, "ai_customization": true, "ats_optimization": true, "downloads": "pdf", "job_matching": "basic", "interview_prep": true, "visiting_cards": 1, "support": "email_48hr"}',
  '{"resumes": 5, "customizations": 15, "interviews": 2, "job_matching": 10}'
),
('Premium', 'premium', 'india', 'INR', 899, 8091,
  '{"templates": "all", "ai_customization": true, "ats_optimization": "advanced", "downloads": "all_formats", "job_matching": "unlimited", "interview_prep": true, "visiting_cards": 10, "analytics": true, "linkedin_optimization": true, "cover_letter": true, "support": "priority_24hr"}',
  '{"resumes": 15, "customizations": 75, "interviews": 12, "job_matching": -1, "cover_letters": 20}'
),
('Ultimate', 'ultimate', 'india', 'INR', 1199, 10791,
  '{"templates": "all", "ai_customization": true, "ats_optimization": "advanced", "downloads": "all_formats", "job_matching": "unlimited", "interview_prep": "unlimited", "visiting_cards": "unlimited", "analytics": true, "linkedin_optimization": true, "cover_letter": true, "resume_distribution": true, "support": "priority_12hr"}',
  '{"resumes": -1, "customizations": 100, "interviews": 15, "job_matching": -1, "cover_letters": 30}'
);

-- Insert subscription plans for Rest of World
INSERT INTO subscription_plans (name, tier, region, currency, price_monthly, price_annual, features, limits) VALUES
('Starter', 'free', 'row', 'USD', 0, 0,
  '{"templates": 1, "ai_customization": false, "downloads": "pdf_watermark", "support": "email_72hr"}',
  '{"resumes": 1, "customizations": 0, "interviews": 0, "job_matching": 0}'
),
('Professional', 'professional', 'row', 'USD', 9.99, 95.90,
  '{"templates": 10, "ai_customization": true, "ats_optimization": true, "downloads": "pdf", "job_matching": "basic", "interview_prep": true, "visiting_cards": 1, "support": "email_48hr"}',
  '{"resumes": 5, "customizations": 15, "interviews": 2, "job_matching": 10}'
),
('Premium', 'premium', 'row', 'USD', 16.99, 163.10,
  '{"templates": "all", "ai_customization": true, "ats_optimization": "advanced", "downloads": "all_formats", "job_matching": "unlimited", "interview_prep": true, "visiting_cards": 10, "analytics": true, "linkedin_optimization": true, "cover_letter": true, "support": "priority_24hr"}',
  '{"resumes": 15, "customizations": 75, "interviews": 12, "job_matching": -1, "cover_letters": 20}'
),
('Ultimate', 'ultimate', 'row', 'USD', 19.99, 191.90,
  '{"templates": "all", "ai_customization": true, "ats_optimization": "advanced", "downloads": "all_formats", "job_matching": "unlimited", "interview_prep": "unlimited", "visiting_cards": "unlimited", "analytics": true, "linkedin_optimization": true, "cover_letter": true, "resume_distribution": true, "support": "priority_12hr"}',
  '{"resumes": -1, "customizations": 100, "interviews": 15, "job_matching": -1, "cover_letters": 30}'
);

-- Function to check usage limits
CREATE OR REPLACE FUNCTION check_usage_limit(
  p_user_id UUID,
  p_feature_type TEXT
) RETURNS BOOLEAN AS $$
DECLARE
  v_subscription_id UUID;
  v_plan_limits JSONB;
  v_current_usage INTEGER;
  v_limit INTEGER;
  v_period_start TIMESTAMPTZ;
  v_period_end TIMESTAMPTZ;
BEGIN
  -- Get active subscription
  SELECT id, sp.limits, s.current_period_start, s.current_period_end
  INTO v_subscription_id, v_plan_limits, v_period_start, v_period_end
  FROM subscriptions s
  JOIN subscription_plans sp ON s.plan_id = sp.id
  WHERE s.user_id = p_user_id AND s.status = 'active'
  LIMIT 1;

  -- If no subscription, return false
  IF v_subscription_id IS NULL THEN
    RETURN FALSE;
  END IF;

  -- Get limit for feature (-1 means unlimited)
  v_limit := (v_plan_limits->p_feature_type)::INTEGER;
  
  -- If unlimited, return true
  IF v_limit = -1 THEN
    RETURN TRUE;
  END IF;

  -- Get current usage
  SELECT COALESCE(usage_count, 0)
  INTO v_current_usage
  FROM usage_tracking
  WHERE user_id = p_user_id
    AND feature_type = p_feature_type
    AND period_start = v_period_start
    AND period_end = v_period_end;

  -- Check if under limit
  RETURN v_current_usage < v_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to increment usage
CREATE OR REPLACE FUNCTION increment_usage(
  p_user_id UUID,
  p_feature_type TEXT
) RETURNS VOID AS $$
DECLARE
  v_subscription_id UUID;
  v_period_start TIMESTAMPTZ;
  v_period_end TIMESTAMPTZ;
BEGIN
  -- Get active subscription period
  SELECT id, current_period_start, current_period_end
  INTO v_subscription_id, v_period_start, v_period_end
  FROM subscriptions
  WHERE user_id = p_user_id AND status = 'active'
  LIMIT 1;

  -- Insert or update usage
  INSERT INTO usage_tracking (user_id, subscription_id, feature_type, usage_count, period_start, period_end)
  VALUES (p_user_id, v_subscription_id, p_feature_type, 1, v_period_start, v_period_end)
  ON CONFLICT (user_id, feature_type, period_start)
  DO UPDATE SET usage_count = usage_tracking.usage_count + 1, updated_at = NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update timestamp trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_subscription_plans_updated_at BEFORE UPDATE ON subscription_plans
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON subscriptions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payment_transactions_updated_at BEFORE UPDATE ON payment_transactions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_usage_tracking_updated_at BEFORE UPDATE ON usage_tracking
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
