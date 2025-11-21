#!/bin/bash

echo "🚀 Deploying UFO Sport to Vercel..."
echo ""

# Set Vercel token
export VERCEL_TOKEN="$VERCEL_TOKEN"

# Create .vercel directory if it doesn't exist
mkdir -p .vercel

# Environment variables
NEXTAUTH_SECRET="qTWz3Gp3zJCZGkB7kLaLdbR8tApisv2a1uXBkoRwSf8="
NEXTAUTH_URL="https://ufosport.cz"
CLOUDINARY_CLOUD_NAME="dq0qvtbst"
CLOUDINARY_API_KEY="596126671243338"
CLOUDINARY_API_SECRET="-37hpT9LFVDodIVcLf2EKp7meRE"

echo "Step 1: Initializing Vercel project..."
vercel --token "$VERCEL_TOKEN" --yes

echo ""
echo "Step 2: Setting environment variables..."

# Set production environment variables
vercel env add DATABASE_URL production --token "$VERCEL_TOKEN" --yes < <(echo "$DATABASE_URL") || true
vercel env add NEXTAUTH_SECRET production --token "$VERCEL_TOKEN" --yes < <(echo "$NEXTAUTH_SECRET") || true
vercel env add NEXTAUTH_URL production --token "$VERCEL_TOKEN" --yes < <(echo "$NEXTAUTH_URL") || true
vercel env add CLOUDINARY_CLOUD_NAME production --token "$VERCEL_TOKEN" --yes < <(echo "$CLOUDINARY_CLOUD_NAME") || true
vercel env add CLOUDINARY_API_KEY production --token "$VERCEL_TOKEN" --yes < <(echo "$CLOUDINARY_API_KEY") || true
vercel env add CLOUDINARY_API_SECRET production --token "$VERCEL_TOKEN" --yes < <(echo "$CLOUDINARY_API_SECRET") || true

# Set preview environment variables (same as production for now)
vercel env add DATABASE_URL preview --token "$VERCEL_TOKEN" --yes < <(echo "$DATABASE_URL") || true
vercel env add NEXTAUTH_SECRET preview --token "$VERCEL_TOKEN" --yes < <(echo "$NEXTAUTH_SECRET") || true
vercel env add NEXTAUTH_URL preview --token "$VERCEL_TOKEN" --yes < <(echo "https://ufosport.cz") || true
vercel env add CLOUDINARY_CLOUD_NAME preview --token "$VERCEL_TOKEN" --yes < <(echo "$CLOUDINARY_CLOUD_NAME") || true
vercel env add CLOUDINARY_API_KEY preview --token "$VERCEL_TOKEN" --yes < <(echo "$CLOUDINARY_API_KEY") || true
vercel env add CLOUDINARY_API_SECRET preview --token "$VERCEL_TOKEN" --yes < <(echo "$CLOUDINARY_API_SECRET") || true

echo ""
echo "Step 3: Deploying to Vercel (production)..."
vercel --prod --token "$VERCEL_TOKEN" --yes

echo ""
echo "✅ Deployment complete!"
echo ""
echo "Next steps:"
echo "1. Add custom domains (www.ufosport.cz and ufosport.cz)"
echo "2. Configure DNS records at Wedos"
