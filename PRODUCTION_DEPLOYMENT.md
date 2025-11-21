# UFO Sport - Production Deployment Guide

## Current Status
✅ Development environment is running successfully
✅ Database created and seeded with test data
✅ Test deployment on Vercel: https://alienshop-7cfqq31v1-voodoo808s-projects.vercel.app/

## Production Deployment Steps

### Step 1: Deploy to Vercel with Production Configuration

Run the automated deployment script:

```bash
export VERCEL_TOKEN="9R5ZI3if5AFLglQSBd1lMx05"
chmod +x deploy-to-vercel.sh
./deploy-to-vercel.sh
```

This script will:
- Initialize your Vercel project
- Set all environment variables (DATABASE_URL, NEXTAUTH_SECRET, NEXTAUTH_URL, Cloudinary credentials)
- Deploy to production

### Step 2: Add Custom Domain (ufosport.cz) to Vercel

#### Option A: Using Vercel CLI (Recommended)

```bash
# Add primary domain
vercel domains add ufosport.cz --token "9R5ZI3if5AFLglQSBd1lMx05"

# Add www subdomain
vercel domains add www.ufosport.cz --token "9R5ZI3if5AFLglQSBd1lMx05"
```

#### Option B: Using Vercel Dashboard

1. Go to https://vercel.com/dashboard
2. Select your project (alienshop or similar)
3. Go to **Settings** → **Domains**
4. Click **Add Domain**
5. Enter `ufosport.cz`
6. Click **Add**
7. Repeat for `www.ufosport.cz`

### Step 3: Configure DNS at Wedos (Your Domain Provider)

After adding the domains to Vercel, you need to configure DNS records at Wedos:

#### DNS Configuration for ufosport.cz:

1. Log in to your Wedos account
2. Go to DNS Management for ufosport.cz
3. Add the following DNS records:

**For root domain (ufosport.cz):**
```
Type: A
Name: @ (or leave empty)
Value: 76.76.21.21
TTL: 300 (or default)
```

**For www subdomain:**
```
Type: CNAME
Name: www
Value: cname.vercel-dns.com
TTL: 300 (or default)
```

**Alternative (if Vercel provides different DNS):**
Vercel might give you specific DNS records after adding the domain. Check your Vercel dashboard under Settings → Domains for the exact DNS records to use.

### Step 4: Verify Domain Configuration

After DNS propagation (usually 5-60 minutes):

1. Visit https://ufosport.cz - Should load your site
2. Visit https://www.ufosport.cz - Should redirect to ufosport.cz
3. Check SSL certificate is active (padlock icon in browser)

### Step 5: Update NEXTAUTH_URL for Production

The deployment script already sets this to `https://ufosport.cz`, but verify in Vercel:

1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Confirm `NEXTAUTH_URL` is set to `https://ufosport.cz` for Production

## Environment Variables Summary

All these are automatically set by the deployment script:

### Production Environment Variables:
- `DATABASE_URL`: Your PostgreSQL connection string
- `NEXTAUTH_SECRET`: qTWz3Gp3zJCZGkB7kLaLdbR8tApisv2a1uXBkoRwSf8=
- `NEXTAUTH_URL`: https://ufosport.cz
- `CLOUDINARY_CLOUD_NAME`: dq0qvtbst
- `CLOUDINARY_API_KEY`: 596126671243338
- `CLOUDINARY_API_SECRET`: -37hpT9LFVDodIVcLf2EKp7meRE

## Post-Deployment Checklist

After your site is live on ufosport.cz:

### 1. Test Core Functionality
- [ ] Homepage loads correctly
- [ ] All product categories display (VOODOO808, SPACE LOVE, RECREATION WELLNESS, T SHIRT GALLERY)
- [ ] Product pages load with images
- [ ] Login works (admin@ufosport.cz / admin123)
- [ ] Admin panel is accessible at /admin
- [ ] Shopping cart functions
- [ ] Checkout process works

### 2. Test Image Uploads (Cloudinary)
- [ ] Log in to admin panel
- [ ] Try uploading a product image
- [ ] Verify image appears correctly

### 3. Security Check
- [ ] HTTPS is enabled (SSL certificate active)
- [ ] Admin login requires authentication
- [ ] Non-admin users cannot access /admin

### 4. Performance Check
- [ ] Page load times are acceptable
- [ ] Images load quickly via Cloudinary CDN
- [ ] No console errors in browser

## Troubleshooting

### Domain Not Loading
- Check DNS propagation: https://dnschecker.org (enter ufosport.cz)
- Verify DNS records at Wedos match Vercel's requirements
- Wait up to 48 hours for full DNS propagation

### Authentication Not Working
- Verify NEXTAUTH_URL is set to `https://ufosport.cz` (not http)
- Check NEXTAUTH_SECRET is set in Vercel environment variables
- Clear browser cookies and try again

### Images Not Uploading
- Verify all Cloudinary credentials are set correctly in Vercel
- Check browser console for errors
- Verify Cloudinary account is active

### Database Connection Issues
- Verify DATABASE_URL is set in Vercel environment variables
- Check your Neon database is active and accepting connections
- Ensure database has been seeded with initial data

## Quick Commands Reference

```bash
# Deploy to production
export VERCEL_TOKEN="9R5ZI3if5AFLglQSBd1lMx05"
./deploy-to-vercel.sh

# Add custom domain
vercel domains add ufosport.cz --token "9R5ZI3if5AFLglQSBd1lMx05"

# Check deployment status
vercel ls --token "9R5ZI3if5AFLglQSBd1lMx05"

# View environment variables
vercel env ls --token "9R5ZI3if5AFLglQSBd1lMx05"
```

## Support

If you encounter any issues:
1. Check the Vercel deployment logs in the dashboard
2. Verify all environment variables are set correctly
3. Check DNS propagation status
4. Review browser console for client-side errors

## Next Steps After Going Live

1. **Monitor Performance**: Use Vercel Analytics to track site performance
2. **Set up Backups**: Configure regular database backups with Neon
3. **Add Real Products**: Replace seed data with your actual products
4. **Configure Email**: Set up Resend or another email service for order notifications
5. **Add Analytics**: Consider adding Google Analytics or similar
6. **SEO Optimization**: Add meta tags, sitemap, and robots.txt
7. **Test Orders**: Process test orders to ensure checkout works end-to-end
