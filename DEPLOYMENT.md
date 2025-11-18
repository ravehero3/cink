# Deployment Guide for Vercel

This e-shop is fully configured for deployment to Vercel. Follow these steps to deploy your application.

## Prerequisites

1. A [Vercel account](https://vercel.com/signup)
2. Your code pushed to a Git repository (GitHub, GitLab, or Bitbucket)
3. A PostgreSQL database (Vercel can provide one, or use Neon/Supabase)

## Environment Variables Required on Vercel

You **must** add these environment variables in your Vercel project settings:

### Authentication
- `NEXTAUTH_SECRET` - Generate using: `openssl rand -base64 32`
- `NEXTAUTH_URL` - Your production URL (e.g., `https://your-site.vercel.app`)
- `GOOGLE_CLIENT_ID` - From Google Cloud Console
- `GOOGLE_CLIENT_SECRET` - From Google Cloud Console

### Database
- `DATABASE_URL` - Your PostgreSQL connection string

### Other (if applicable)
- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`
- `RESEND_API_KEY`

## Deployment Steps

### 1. Connect Your Repository to Vercel

1. Go to [vercel.com/new](https://vercel.com/new)
2. Import your Git repository
3. Vercel will auto-detect Next.js framework settings

### 2. Configure Environment Variables

1. In your Vercel project settings, go to **Environment Variables**
2. Add all required secrets listed above
3. Make sure to add them for **Production**, **Preview**, and **Development** environments

### 3. Update Google OAuth Settings

1. Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. Edit your OAuth 2.0 Client ID
3. Add your Vercel production URL to **Authorized redirect URIs**:
   ```
   https://your-site.vercel.app/api/auth/callback/google
   ```

### 4. Database Setup

- If using Vercel Postgres, create a database in your project settings
- If using external PostgreSQL (Neon, Supabase, etc.), add the `DATABASE_URL` to environment variables
- After first deployment, run migrations by connecting to your deployment and running:
  ```bash
  npx prisma db push
  ```

### 5. Deploy

1. Click **Deploy** in Vercel
2. Wait for the build to complete
3. Your site will be live at `https://your-project.vercel.app`

## Post-Deployment

### Seed the Database (Optional)

If you need to add initial data:

```bash
# Connect to your production database locally
DATABASE_URL="your-production-db-url" npm run db:seed
```

### Custom Domain

1. Go to your Vercel project settings
2. Navigate to **Domains**
3. Add your custom domain
4. Update DNS records as instructed by Vercel
5. Update `NEXTAUTH_URL` environment variable to your custom domain
6. Update Google OAuth redirect URIs to include your custom domain

## Troubleshooting

### Build Fails

- Check build logs in Vercel dashboard
- Ensure all environment variables are set
- Verify `postinstall` script runs `prisma generate`

### Authentication Errors

- Verify `NEXTAUTH_SECRET` is set
- Check `NEXTAUTH_URL` matches your actual domain
- Ensure Google OAuth redirect URIs are correct

### Database Connection Issues

- Verify `DATABASE_URL` is correct
- Check if your database allows connections from Vercel's IP addresses
- For Neon/Supabase, ensure connection pooling is enabled

## Production Checklist

- ✅ All environment variables configured
- ✅ Google OAuth redirect URIs updated
- ✅ Database migrations applied
- ✅ Custom domain configured (if applicable)
- ✅ Test authentication flow
- ✅ Test product pages load correctly
- ✅ Verify admin panel functionality

## Support

For Vercel-specific issues, consult:
- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Deployment Docs](https://nextjs.org/docs/deployment)
- [NextAuth.js Deployment](https://next-auth.js.org/deployment)
