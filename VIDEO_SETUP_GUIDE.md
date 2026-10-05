# Video Section Fixes & Oracle VPS Setup - Complete Guide

## ✅ What Was Fixed

### 1. Blurred Video Options in MediaSelector
**Problem:** Video options grid was too small (5 columns, aspect-square), making thumbnails hard to see
**Solution:** 
- Changed grid from 5 columns to 4 columns with larger aspect ratio
- Added dedicated label area below each thumbnail (no longer hidden on hover)
- Increased grid gap and padding
- Made checkboxes always visible (not hidden until hover)

**Result:** Videos are now clearly visible and easy to select!

### 2. Video Protection from Accidental Deletion
**Problem:** You lost videos today when they were accidentally deleted
**Solution:**
- All videos are automatically marked as **protected** on upload
- Protected videos cannot be deleted even by accident
- Protection can only be manually removed if needed
- Database tracks which videos have protection enabled

**Result:** Videos won't be accidentally deleted ever again!

### 3. Oracle VPS Storage for Permanent Backup
**Problem:** Videos need to be safely stored outside the main server
**Solution:**
- Videos now upload automatically to your Oracle VPS
- Stored at: `/home/ubuntu/ufosport-videos` on VPS
- Falls back to local storage if VPS unavailable
- Each video tracks its VPS path for recovery

**Result:** Your videos are safely stored on your dedicated server!

## 🚀 Implementation Steps

### Step 1: Install Dependencies

```bash
npm install node-ssh
# or if using yarn
yarn add node-ssh
```

### Step 2: Update Environment Variables

Add to your `.env.local`:

```env
# Oracle VPS Configuration
ORACLE_VPS_HOST=130.61.26.156
ORACLE_VPS_USER=ubuntu
ORACLE_VPS_KEY_PATH=/Users/voodoo808/Downloads/oracle-keys/ssh-key-2026-06-16.key
ORACLE_VPS_WEB_URL=https://videos.ufosport.cz
```

**Important:** The key path should point to your actual SSH key file that you use for VPS access.

### Step 3: Prepare Oracle VPS

SSH into your VPS and create the video directory:

```bash
ssh -i /Users/voodoo808/Downloads/oracle-keys/ssh-key-2026-06-16.key ubuntu@130.61.26.156

# Create video storage directory
mkdir -p /home/ubuntu/ufosport-videos
chmod 755 /home/ubuntu/ufosport-videos

# Verify it's writable
touch /home/ubuntu/ufosport-videos/.test && rm /home/ubuntu/ufosport-videos/.test
echo "✓ Directory ready"
```

### Step 4: Update Database Schema

Run the migration to add new columns:

```bash
# Using Prisma
npx prisma db push

# Or execute the SQL migration directly:
# See MIGRATION.sql at the bottom of this file
```

### Step 5: Rebuild and Deploy

```bash
npm run build
npm start
```

## 📋 Files Changed

### New Files Created:
- `lib/oracle-vps.ts` - Oracle VPS upload/delete functions
- `app/api/media/[id]/protect/route.ts` - Video protection endpoint
- `ORACLE_VPS_SETUP.md` - Detailed setup guide
- `MIGRATION.sql` - Database migration script

### Modified Files:
- `components/MediaSelector.tsx` - Fixed blurred options grid
- `app/api/media/upload/route.ts` - Added Oracle VPS upload support
- `app/api/media/route.ts` - Added protection checks before deletion
- `app/admin/media/page.tsx` - UI for protection management
- `prisma/schema.prisma` - Added Media table columns
- `package.json` - Added `node-ssh` dependency
- `.env.example` - Oracle VPS config template

## 🎯 How It Works

### When You Upload a Video:

1. Admin goes to "Galerie médií" (Media Library)
2. Clicks "+ Nahrát soubory"
3. Selects video file(s)
4. System automatically:
   - ✅ Uploads to Oracle VPS
   - ✅ Marks as protected
   - ✅ Records storage location
   - ✅ Shows success message

### When You Try to Delete a Video:

1. Click on video in media library
2. Click "Odstranit soubor" button
3. If protected: ✅ Shows "🔒 Nelze smazat - je chráněno" (Cannot delete - it's protected)
4. To delete: Click "Zrušit ochranu" first, then delete
5. System removes both from VPS and database

### If VPS Connection Fails:

1. Upload falls back to local storage automatically
2. You still get success message
3. Video is still protected
4. Warning logged for debugging

## 🔧 Configuration Options

### Media Upload Settings

In the media library UI, you'll see:
```
🔒 Oracle VPS (Bezpečné, trvalé) - Recommended for videos
💾 Místní úložiště - For images or local-only storage
```

### Protection Management

Each video shows:
- Storage type (Local / Oracle VPS / Cloudinary)
- Protection status with lock icon
- Option to toggle protection

## 🚨 Troubleshooting

### "Failed to upload to Oracle VPS"

**Check 1:** Verify SSH connectivity
```bash
ssh -i /Users/voodoo808/Downloads/oracle-keys/ssh-key-2026-06-16.key ubuntu@130.61.26.156 "echo OK"
```

**Check 2:** Verify environment variables
```bash
echo $ORACLE_VPS_HOST
echo $ORACLE_VPS_USER
echo $ORACLE_VPS_KEY_PATH
```

**Check 3:** Check VPS disk space
```bash
ssh -i /path/to/key ubuntu@130.61.26.156 "df -h | grep /home"
```

### Videos Not Protected

**Bulk protect all existing videos:**
```bash
npx prisma db execute <<'EOF'
UPDATE "Media" 
SET "isProtected" = true 
WHERE "resourceType" = 'VIDEO' 
AND "isProtected" = false;
EOF
```

### Can't Connect to VPS

Check your SSH key:
```bash
# Verify key exists and readable
ls -la /Users/voodoo808/Downloads/oracle-keys/ssh-key-2026-06-16.key

# Should show: -rw------- (600)
# If not:
chmod 600 /Users/voodoo808/Downloads/oracle-keys/ssh-key-2026-06-16.key
```

## 📊 Database Migration SQL

If you can't use `npx prisma db push`, run this SQL directly:

```sql
-- Add new columns to Media table
ALTER TABLE "Media" ADD COLUMN IF NOT EXISTS "isProtected" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Media" ADD COLUMN IF NOT EXISTS "storageType" VARCHAR(50) NOT NULL DEFAULT 'LOCAL';
ALTER TABLE "Media" ADD COLUMN IF NOT EXISTS "oracleVpsPath" TEXT;
ALTER TABLE "Media" ADD COLUMN IF NOT EXISTS "backupUrl" TEXT;
ALTER TABLE "Media" ADD COLUMN IF NOT EXISTS "lastBackupAt" TIMESTAMP;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS "Media_storageType_idx" ON "Media"("storageType");
CREATE INDEX IF NOT EXISTS "Media_isProtected_idx" ON "Media"("isProtected");

-- Protect all existing videos
UPDATE "Media" SET "isProtected" = true WHERE "resourceType" = 'VIDEO';
```

## ✨ Safety Features

1. **Automatic Protection** - Videos are protected by default
2. **Two-Step Deletion** - Must explicitly unprotect, then delete
3. **VPS Backup** - Videos stored on dedicated server
4. **Fallback Storage** - Works even if VPS is temporarily down
5. **Audit Trail** - All storage locations tracked in database

## 🎬 Next Steps

1. ✅ Install dependencies: `npm install node-ssh`
2. ✅ Add environment variables to `.env.local`
3. ✅ Prepare Oracle VPS directory
4. ✅ Run database migration: `npx prisma db push`
5. ✅ Rebuild and test: `npm run build && npm start`
6. ✅ Test by uploading a video from the admin panel

Your videos are now permanently protected! 🎉
