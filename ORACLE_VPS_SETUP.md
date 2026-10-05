# Oracle VPS Video Storage Setup Guide

## Overview
Videos uploaded to your e-shop are now automatically protected and stored on your Oracle VPS for permanent backup and fast delivery.

## What Changed

1. **Blurred Video Options Fixed** ✅
   - Video selector grid is now larger and more visible
   - Checkboxes appear on hover instead of being hidden

2. **Automatic Video Protection** 🔒
   - All videos are automatically marked as **protected** on upload
   - Protected videos cannot be accidentally deleted
   - You can manually unprotect videos in the media library if needed

3. **Oracle VPS Storage** ☁️
   - Videos are automatically uploaded to your Oracle VPS at: `/home/ubuntu/ufosport-videos`
   - Falls back to local storage if VPS connection fails
   - Each video has a secondary backup URL stored in the database

## Environment Setup

Add these variables to your `.env.local` file:

```env
ORACLE_VPS_HOST=130.61.26.156
ORACLE_VPS_USER=ubuntu
ORACLE_VPS_KEY_PATH=/Users/voodoo808/Downloads/oracle-keys/ssh-key-2026-06-16.key
ORACLE_VPS_WEB_URL=https://videos.ufosport.cz
```

## SSH Key Requirements

Your SSH key (`ssh-key-2026-06-16.key`) should:
- Have read permissions: `chmod 600 /path/to/ssh-key`
- Be accessible from your development environment
- Have proper passphrase handling (or be passphrase-less)

## Database Migration

Run this command to update your database schema:

```bash
npm run build
# or
npx prisma db push
```

New columns added to the `Media` table:
- `isProtected` (Boolean) - Prevents deletion of protected videos
- `storageType` (String) - LOCAL | ORACLE_VPS | CLOUDINARY
- `oracleVpsPath` (String) - Path on VPS
- `backupUrl` (String) - Secondary URL for failover
- `lastBackupAt` (DateTime) - When last backup occurred

## How to Use

### Uploading Videos

1. Go to Admin > Galerie médií
2. Click **"+ Nahrát soubory"**
3. Select videos to upload
4. Videos are automatically:
   - Uploaded to Oracle VPS
   - Marked as protected
   - Available immediately

### Managing Video Protection

In the media library detail view:

- 🔒 **Chránit video** - Locks the video from deletion (auto-enabled for new videos)
- **Zrušit ochranu** - Removes protection (only for manual unprotect)
- **Odstranit soubor** - Grayed out if protected

### Recovery

If a video is accidentally deleted at the VPS level:

1. SSH into your VPS:
   ```bash
   ssh -i /Users/voodoo808/Downloads/oracle-keys/ssh-key-2026-06-16.key ubuntu@130.61.26.156
   ```

2. Check video directory:
   ```bash
   ls -la /home/ubuntu/ufosport-videos/
   ```

3. Restore if needed from backups

## Troubleshooting

### VPS Upload Fails

If you see: "Failed to upload to Oracle VPS: Connection refused"

1. Verify SSH key path in `.env.local`
2. Test SSH manually:
   ```bash
   ssh -i /Users/voodoo808/Downloads/oracle-keys/ssh-key-2026-06-16.key ubuntu@130.61.26.156 "echo OK"
   ```
3. Check VPS disk space: `df -h`
4. Check server logs: `tail -f ~/.docker/desktop/log/vm/dockerd.log`

### Videos Not Protected

If videos weren't protected on creation:

```bash
# Mark all existing videos as protected
npx prisma db execute << 'EOF'
UPDATE "Media" 
SET "isProtected" = true 
WHERE "resourceType" = 'VIDEO' 
AND "isProtected" = false;
EOF
```

### Can't Delete Protected Video

This is by design. To allow deletion:

1. Click the video in media library
2. Click **"Zrušit ochranu"**
3. Then click **"Odstranit soubor"**

## Performance Notes

- Video uploads to VPS happen in the background
- If VPS is slow, the upload falls back to local storage automatically
- No impact on user experience if VPS is down
- Videos are served from your Oracle VPS directly via `/home/ubuntu/ufosport-videos`

## Security

- SSH key must be kept secure and never committed to git
- Videos are stored outside web root
- Access controlled via Ubuntu user permissions
- Regular backups recommended (script included below)

## Backup Script (Optional)

Create `/scripts/backup-videos.sh` on your VPS:

```bash
#!/bin/bash
BACKUP_DIR="/home/ubuntu/ufosport-videos-backups"
DATE=$(date +%Y%m%d_%H%M%S)
mkdir -p "$BACKUP_DIR"
tar -czf "$BACKUP_DIR/videos-$DATE.tar.gz" /home/ubuntu/ufosport-videos/
echo "Backup completed: $BACKUP_DIR/videos-$DATE.tar.gz"
```

Set up cron job to run daily:
```bash
0 2 * * * /home/ubuntu/scripts/backup-videos.sh
```

## Support

If you encounter issues:

1. Check `.env.local` has all required variables
2. Verify SSH key permissions: `ls -l ~/.ssh/ssh-key-2026-06-16.key`
3. Review server logs for errors
4. Test connection manually with SSH command above
