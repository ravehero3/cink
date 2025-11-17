# UFO Sport E-shop Setup Guide

## 🚀 Quick Start

### 1. Database Setup
The project uses PostgreSQL with Prisma ORM. The database includes:
- Admin user (always available)
- Product catalog
- Categories
- Orders and customer data

### 2. Admin Access
```
Email: admin@ufosport.cz
Password: admin123
```
**This admin user is stored in the database and will always be available.**

---

## 🔐 Environment Variables & Secrets

### **Important: How Secrets Work**

**✅ DO:**
- Store secrets in Replit Secrets (for Replit environment)
- Use `.env` files for local development (never commit these)
- Use deployment platform's secret manager for production

**❌ DON'T:**
- Put secrets in your code files
- Commit `.env` files to GitHub
- Share secrets publicly

---

## 📋 Required Environment Variables

### **Core Authentication (Required)**
```bash
NEXTAUTH_SECRET=<random-string>
NEXTAUTH_URL=<your-app-url>
```

### **Database (Auto-configured by Replit)**
```bash
DATABASE_URL=<auto-configured>
PGHOST=<auto-configured>
PGPORT=<auto-configured>
PGUSER=<auto-configured>
PGPASSWORD=<auto-configured>
PGDATABASE=<auto-configured>
```

### **Google OAuth (Optional)**
Only needed if you want Google sign-in:
```bash
GOOGLE_CLIENT_ID=<from-google-cloud-console>
GOOGLE_CLIENT_SECRET=<from-google-cloud-console>
```

---

## 🔄 Setting Up in Different Environments

### **On Replit:**
1. Click the "Secrets" icon (🔒) in the left sidebar
2. Add each secret as a key-value pair
3. Secrets are automatically available as environment variables
4. **Secrets sync to deployments automatically**

### **For Local Development:**
1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
2. Fill in your local values in `.env`
3. `.env` is in `.gitignore` so it won't be committed

### **For Production/Deployment:**
1. Add secrets in your hosting platform's dashboard
2. For Replit deployments: secrets sync automatically from workspace
3. For other platforms (Vercel, Netlify, etc.): add in their UI

---

## 🗄️ Database & User Persistence

### **How Data Persists:**
- **Database data** (users, products, orders) = **PERMANENT**
- **Secrets** (API keys, passwords) = **Environment-specific**

### **Admin User:**
The admin user (`admin@ufosport.cz`) is stored in your PostgreSQL database and will:
- ✅ Survive code updates
- ✅ Survive redeployments
- ✅ Persist across GitHub pushes/pulls
- ✅ Work in any environment with the same database

### **Recreating Admin User (if needed):**
If you ever need to recreate the admin user or seed sample data:
```bash
npm run db:seed
```

This will:
- Create admin@ufosport.cz with password admin123
- Add sample categories and products
- Safe to run multiple times (won't duplicate)

---

## 🔧 Initial Setup Commands

### **First Time Setup:**
```bash
# 1. Install dependencies
npm install

# 2. Generate Prisma client
npm run db:generate

# 3. Push schema to database
npm run db:push

# 4. Seed database with admin user and sample data
npm run db:seed

# 5. Start development server
npm run dev
```

### **After Pulling from GitHub:**
```bash
# 1. Install any new dependencies
npm install

# 2. Update Prisma client if schema changed
npm run db:generate

# 3. Sync database schema (if changed)
npm run db:push

# 4. Start server
npm run dev
```

---

## 🌐 Setting Up Google OAuth

### **1. Create OAuth Credentials:**
1. Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. Create a project (or select existing)
3. Enable "Google+ API"
4. Create OAuth 2.0 Client ID
5. Add authorized redirect URI:
   ```
   https://your-replit-url/api/auth/callback/google
   https://your-production-url/api/auth/callback/google
   ```

### **2. Copy Credentials:**
- Copy the **Client ID** → Add to `GOOGLE_CLIENT_ID`
- Copy the **Client Secret** → Add to `GOOGLE_CLIENT_SECRET`

### **3. Add to Secrets:**
- In Replit: Add to Secrets sidebar
- Locally: Add to `.env` file
- Production: Add to deployment platform

---

## 📁 Project Structure

```
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   │   └── auth/         # NextAuth configuration
│   ├── admin/            # Admin pages
│   └── ...               # Other pages
├── prisma/
│   ├── schema.prisma     # Database schema
│   └── seed.ts           # Database seeding script
├── .env.example          # Template for environment variables
├── .gitignore            # Excludes .env files from git
└── SETUP.md              # This file
```

---

## ❓ FAQ

### **Q: What happens when I download the project from Replit?**
**A:** The code downloads, but secrets stay in Replit. You'll need to set them up again in your new environment using `.env.example` as a guide.

### **Q: Will the admin user be lost?**
**A:** No! The admin user is in the **database**, which is separate from secrets. As long as you use the same database, the admin user persists.

### **Q: How do I deploy to production?**
**A:** 
1. Push code to GitHub (secrets are excluded automatically)
2. Deploy to Replit, Vercel, or another platform
3. Set up secrets in that platform's UI
4. Connect to your production database
5. Run `npm run db:push` and `npm run db:seed` in production

### **Q: Can I use the same database for dev and production?**
**A:** Not recommended. Use separate databases:
- Development: Replit's built-in PostgreSQL
- Production: Production database URL in `DATABASE_URL`

### **Q: How do I generate NEXTAUTH_SECRET?**
**A:** Run this command:
```bash
openssl rand -base64 32
```

---

## 🆘 Troubleshooting

### **"nesprávný email nebo heslo" (incorrect email or password)**
1. Make sure database is seeded: `npm run db:seed`
2. Verify NEXTAUTH_SECRET is set in secrets
3. Check database connection is working

### **Google sign-in doesn't work**
1. Verify GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET are correct
2. Check redirect URI in Google Console matches your URL
3. Ensure NEXTAUTH_URL is set to your app's URL

### **Database connection errors**
1. Check DATABASE_URL is set correctly
2. Run `npm run db:generate` to regenerate Prisma client
3. Run `npm run db:push` to sync schema

---

## 📞 Support

For issues or questions, check:
- Project README.md
- Replit documentation
- NextAuth.js documentation
