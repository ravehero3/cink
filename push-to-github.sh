#!/bin/bash

echo "🚀 Pushing code to GitHub repository: alienshop"
echo ""

# Remove old origin if it exists
git remote remove origin 2>/dev/null || true

# Add new origin
git remote add origin https://github.com/ravehero3/alienshop.git

# Show current branch
echo "Current branch:"
git branch --show-current

# Add all files
git add -A

# Create commit if there are changes
if git diff --staged --quiet; then
  echo "✓ No changes to commit"
else
  git commit -m "Initial commit: UFO Sport e-commerce website

- Next.js 14 with TypeScript
- Prisma ORM with PostgreSQL
- Cloudinary for media storage
- NextAuth for authentication
- Tailwind CSS for styling
- Sample products and categories seeded
"
fi

# Push to GitHub
echo ""
echo "Pushing to GitHub..."
git push -u origin main --force

echo ""
echo "✅ Code pushed successfully to: https://github.com/ravehero3/alienshop"
