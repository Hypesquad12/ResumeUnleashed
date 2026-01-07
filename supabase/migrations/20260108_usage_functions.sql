-- Add RPC function to check resume limit for client-side use
CREATE OR REPLACE FUNCTION check_resume_limit(p_user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  v_subscription_id UUID;
  v_plan_limits JSONB;
  v_resume_count INTEGER;
  v_resume_limit INTEGER;
BEGIN
  -- Get active subscription
  SELECT id, sp.limits
  INTO v_subscription_id, v_plan_limits
  FROM subscriptions s
  JOIN subscription_plans sp ON s.plan_id = sp.id
  WHERE s.user_id = p_user_id AND s.status = 'active'
  LIMIT 1;

  -- If no subscription, check free tier limit (1 resume)
  IF v_subscription_id IS NULL THEN
    SELECT COUNT(*)
    INTO v_resume_count
    FROM resumes
    WHERE user_id = p_user_id;
    
    RETURN v_resume_count < 1;
  END IF;

  -- Get resume limit from plan
  v_resume_limit := (v_plan_limits->>'resumes')::INTEGER;
  
  -- If unlimited (-1), return true
  IF v_resume_limit = -1 THEN
    RETURN TRUE;
  END IF;

  -- Count user's resumes
  SELECT COUNT(*)
  INTO v_resume_count
  FROM resumes
  WHERE user_id = p_user_id;

  -- Check if under limit
  RETURN v_resume_count < v_resume_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION check_resume_limit(UUID) TO authenticated;
