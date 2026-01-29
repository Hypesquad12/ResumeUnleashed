#!/bin/bash

# Razorpay Flow Tests Runner
# This script runs all Razorpay subscription flow tests

echo "🧪 Razorpay Subscription Flow Tests"
echo "===================================="
echo ""

# Check if .env.local exists
if [ ! -f .env.local ]; then
    echo "❌ Error: .env.local file not found"
    echo "Please create .env.local with required environment variables"
    exit 1
fi

# Load environment variables
export $(cat .env.local | grep -v '^#' | xargs)

# Check required environment variables
if [ -z "$NEXT_PUBLIC_SUPABASE_URL" ]; then
    echo "❌ Error: NEXT_PUBLIC_SUPABASE_URL not set"
    exit 1
fi

if [ -z "$SUPABASE_SERVICE_ROLE_KEY" ]; then
    echo "❌ Error: SUPABASE_SERVICE_ROLE_KEY not set"
    exit 1
fi

if [ -z "$NEXT_PUBLIC_APP_URL" ]; then
    echo "⚠️  Warning: NEXT_PUBLIC_APP_URL not set, using http://localhost:3000"
    export NEXT_PUBLIC_APP_URL="http://localhost:3000"
fi

echo "✅ Environment variables loaded"
echo ""
echo "Configuration:"
echo "  Supabase URL: $NEXT_PUBLIC_SUPABASE_URL"
echo "  App URL: $NEXT_PUBLIC_APP_URL"
echo ""

# Check if dev server is running
echo "🔍 Checking if dev server is running..."
if curl -s "$NEXT_PUBLIC_APP_URL" > /dev/null; then
    echo "✅ Dev server is running"
else
    echo "❌ Error: Dev server is not running at $NEXT_PUBLIC_APP_URL"
    echo "Please start the dev server with: npm run dev"
    exit 1
fi

echo ""
echo "🚀 Running tests..."
echo ""

# Run the test script
npx tsx tests/razorpay-flows.test.ts

echo ""
echo "✅ Test execution completed"
