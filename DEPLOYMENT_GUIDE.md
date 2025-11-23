# Vercel Deployment Guide - UFO Sport E-shop

## Step 1: Prepare Your Repository ✅
Your code is already on GitHub: https://github.com/ravehero3/cink.git

## Step 2: Set Up on Vercel

1. Go to https://vercel.com/new
2. Import your GitHub repository: `ravehero3/cink`
3. Select Next.js as the framework (should auto-detect)
4. Click "Deploy"

## Step 3: Add Environment Variables to Vercel

After importing, go to your project settings and add these environment variables:

### Required Variables:

| Variable | Value | Where to Get |
|----------|-------|-------------|
| `DATABASE_URL` | Your Neon connection string | https://console.neon.tech/ |
| `NEXTAUTH_SECRET` | Generated secret (see below) | Generate with: `openssl rand -base64 32` |
| `NEXTAUTH_URL` | `https://your-app.vercel.app` | Replace with your actual Vercel domain |

### Optional Variables (if you have them):

| Variable | Value |
|----------|-------|
| `GOOGLE_CLIENT_ID` | From Google Cloud Console |
| `GOOGLE_CLIENT_SECRET` | From Google Cloud Console |
| `GOPAY_GO_ID` | From your GoPay account |
| `GOPAY_CLIENT_ID` | From your GoPay account |
| `GOPAY_CLIENT_SECRET` | From your GoPay account |
| `GOPAY_ENVIRONMENT` | `test` or `production` |
| `RESEND_API_KEY` | From https://resend.com/api-keys |
| `CLOUDINARY_URL` | From https://console.cloudinary.com/settings/api-keys |
| `ZASILKOVNA_API_KEY` | From your Zásilkovna account |

## Step 4: How to Add Environment Variables in Vercel

1. Go to your Vercel project dashboard
2. Click **Settings** → **Environment Variables**
3. For each variable, click **Add New**
4. Enter the variable name and value
5. Select which environments need it (Production, Preview, Development)
6. Click **Save**

## Step 5: Deploy

After adding all environment variables:
1. Go back to your project
2. Click **Deployments**
3. The latest deployment should show
4. Vercel automatically redeploys when you push to GitHub

## ✨ Important Notes:

- **Never commit `.env` files to GitHub** - Vercel variables are secret and secure
- **Database migrations** are handled by Prisma automatically on first deploy
- **First deployment may take 5-10 minutes** - Prisma needs to set up the database schema
- **Check deployment logs** if there are issues: Deployments → Click latest → View logs

## 🚀 Next Steps:

1. Generate your NEXTAUTH_SECRET (see below)
2. Deploy to Vercel
3. Add environment variables
4. Wait for first successful deployment
5. Test your live site!

---

## Your Generated NEXTAUTH_SECRET

Use this value for `NEXTAUTH_SECRET` in Vercel:
```
[GENERATED_SECRET_WILL_APPEAR_HERE]
```

Keep it safe! 🔐
