#!/bin/bash

echo "🌐 Adding ufosport.cz domain to Vercel..."
echo ""

# Set Vercel token
export VERCEL_TOKEN="9R5ZI3if5AFLglQSBd1lMx05"

echo "Step 1: Adding primary domain (ufosport.cz)..."
vercel domains add ufosport.cz --token "$VERCEL_TOKEN" --yes

echo ""
echo "Step 2: Adding www subdomain (www.ufosport.cz)..."
vercel domains add www.ufosport.cz --token "$VERCEL_TOKEN" --yes

echo ""
echo "✅ Domains added to Vercel!"
echo ""
echo "📋 Next: Configure DNS at Wedos"
echo ""
echo "Add these DNS records at Wedos:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "1. For root domain (ufosport.cz):"
echo "   Type: A"
echo "   Name: @ (or leave empty)"
echo "   Value: 76.76.21.21"
echo "   TTL: 300"
echo ""
echo "2. For www subdomain:"
echo "   Type: CNAME"
echo "   Name: www"
echo "   Value: cname.vercel-dns.com"
echo "   TTL: 300"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "⏱️  DNS propagation may take 5-60 minutes"
echo "🔍 Check status at: https://dnschecker.org"
echo ""
