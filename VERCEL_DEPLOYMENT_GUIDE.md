# Vercel Deployment Fix Guide

## Issues Identified
1. ❌ Google Sign Up not working
2. ❌ Users can't create accounts

## Root Causes
- Missing environment variables in Vercel
- Google OAuth not configured for your Vercel domain

---

## ✅ Solution: Step-by-Step Fix

### Step 1: Set Up Google OAuth Console

1. **Go to [Google Cloud Console](https://console.cloud.google.com/)**
   - Select your project (or create a new one)

2. **Configure OAuth Consent Screen**
   - Go to "APIs & Services" → "OAuth consent screen"
   - Choose "External" for user type
   - Fill in required information (app name, support email, developer contact)
   - Add authorized domains (your Vercel domain)
   - Add your email to test users
   - Save and continue through all steps

3. **Create OAuth 2.0 Credentials**
   - Go to "APIs & Services" → "Credentials"
   - Click "Create Credentials" → "OAuth 2.0 Client ID"
   - Application type: "Web application"
   - Add **Authorized redirect URIs**:
     ```
     https://your-vercel-domain.vercel.app/api/auth/callback/google
     ```
     Replace `your-vercel-domain` with your actual Vercel domain
   
   - For custom domain (if you have one):
     ```
     https://your-custom-domain.com/api/auth/callback/google
     ```

4. **Save the credentials**
   - Copy the `Client ID` and `Client Secret` - you'll need these for Vercel!

---

### Step 2: Add Environment Variables to Vercel

Go to your Vercel project settings and add these environment variables:

#### Required Environment Variables:

| Variable Name | Value | Description |
|--------------|-------|-------------|
| `DATABASE_URL` | Your production PostgreSQL connection string | Connection to your database |
| `NEXTAUTH_URL` | `https://your-vercel-domain.vercel.app` | Your production URL |
| `NEXTAUTH_SECRET` | **Generate a new one** (see below) | Secret key for NextAuth - MUST be unique! |
| `GOOGLE_CLIENT_ID` | From Google Console | OAuth Client ID |
| `GOOGLE_CLIENT_SECRET` | From Google Console | OAuth Client Secret |

**⚠️ IMPORTANT**: Generate a unique `NEXTAUTH_SECRET` using:
```bash
openssl rand -base64 32
```

#### Optional (if using Cloudinary for image uploads):

If you're using Cloudinary, add these from your Cloudinary dashboard:

| Variable Name | Where to find it |
|--------------|------------------|
| `CLOUDINARY_CLOUD_NAME` | Cloudinary Dashboard → Account Details |
| `CLOUDINARY_API_KEY` | Cloudinary Dashboard → Account Details |
| `CLOUDINARY_API_SECRET` | Cloudinary Dashboard → Account Details |

---

### Step 3: Set Up Production Database

Your app needs a PostgreSQL database in production. You have a few options:

#### Option 1: Vercel Postgres (Recommended)
1. Go to your Vercel project
2. Click "Storage" tab
3. Create a new Postgres database
4. Vercel will automatically add `DATABASE_URL` to your environment variables

#### Option 2: Neon Database (Free tier available)
1. Go to [Neon](https://neon.tech/)
2. Create a new project
3. Copy the connection string
4. Add it as `DATABASE_URL` in Vercel environment variables

#### Option 3: Use your existing database
- If you have a PostgreSQL database, use its connection string as `DATABASE_URL`

---

### Step 4: Deploy and Test

1. **Redeploy your application**
   - In Vercel, go to "Deployments"
   - Click the three dots on the latest deployment
   - Click "Redeploy"

2. **Test Google Sign Up**
   - Visit your production site
   - Click "Sign in with Google"
   - It should now work!

3. **Test User Registration**
   - Try creating a new account with email/password
   - It should now save to the database

---

## How to Add Environment Variables in Vercel

1. Go to your Vercel dashboard
2. Select your project
3. Click "Settings" tab
4. Click "Environment Variables" in the sidebar
5. For each variable:
   - Enter the variable name
   - Enter the value
   - Select environments (Production, Preview, Development)
   - Click "Add"

---

## Troubleshooting

### Google Sign In Still Not Working?
- ✅ Check that the redirect URI in Google Console exactly matches your Vercel domain
- ✅ Make sure you've redeployed after adding environment variables
- ✅ Check the browser console for error messages

### User Registration Still Failing?
- ✅ Verify `DATABASE_URL` is correctly set in Vercel
- ✅ Make sure your database is accessible from Vercel's servers
- ✅ Check Vercel function logs for error details

### How to View Logs in Vercel
1. Go to your project in Vercel
2. Click "Deployments"
3. Click on the latest deployment
4. Click "Functions" tab
5. Click on any function to see its logs

---

## ⚠️ Security Note

**IMPORTANT**: The `NEXTAUTH_SECRET` in your development environment should NOT be used in production. Always generate a new, unique secret for production using the command above.

---

## Summary Checklist

- [ ] Google OAuth credentials created
- [ ] Redirect URI added to Google Console
- [ ] All environment variables added to Vercel
- [ ] Production database set up
- [ ] Application redeployed
- [ ] Google sign-in tested
- [ ] User registration tested

---

## Need Help?

If you're still experiencing issues:
1. Check Vercel function logs for detailed error messages
2. Verify all environment variables are set correctly
3. Make sure your database is accessible
4. Ensure the redirect URI in Google Console exactly matches your domain
