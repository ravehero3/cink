# VPS Disk Space Cleanup - URGENT

The GitHub Actions build is failing because the VPS Docker build directory is out of disk space.

## Quick Fix (SSH into VPS as ubuntu@130.61.26.156)

```bash
# Free up space immediately
docker system prune -a -f
docker volume prune -f
docker builder prune -a -f

# Check disk usage
df -h /

# Clear npm cache
rm -rf ~/.npm
npm cache clean --force

# Clear old logs
rm -rf ~/apps/logs/*.log

# Check what's taking space
du -sh ~/apps/* 2>/dev/null | sort -rh
du -sh /var/lib/docker/* 2>/dev/null | sort -rh
```

## Expected Freed Space
- `docker system prune -a -f` = 2-5 GB (removes stopped containers, unused images)
- `docker builder prune -a -f` = 1-3 GB (removes Docker build cache)
- Combined: typically 5-10 GB

## Full Cleanup Script (Copy & Paste)

```bash
#!/bin/bash
set -e

echo "🧹 Starting VPS cleanup..."

# Stop all containers
echo "Stopping containers..."
docker compose down -v 2>/dev/null || true

# Remove everything
echo "Removing Docker objects..."
docker system prune -a -f
docker volume prune -f
docker builder prune -a -f

# Clear caches
echo "Clearing caches..."
rm -rf ~/.npm
npm cache clean --force

# Clear app temp files
echo "Clearing app temp files..."
rm -rf ~/apps/.next
rm -rf ~/apps/node_modules/.cache
rm -rf /tmp/*

# Check final status
echo -e "\n📊 Disk Status After Cleanup:"
df -h / | tail -1

echo -e "\n✅ Cleanup complete!"
echo "Now deploy with: cd ~/apps && docker compose up --pull always -d cink"
```

## After Cleanup

1. **Deploy the fixed code:**
   ```bash
   cd ~/apps/cink
   git pull origin main
   cd ~/apps
   docker compose build cink
   docker compose up -d cink
   ```

2. **Verify deployment:**
   ```bash
   curl -I https://ufosport.cz
   # Should return HTTP 200
   ```

3. **Check logs:**
   ```bash
   docker logs apps-cink-1 | tail -50
   ```

## What Changed in This Fix

✅ Removed ssh2 native dependency (was causing build bloat)
✅ Optimized Dockerfile:
  - Cleans apt cache after install
  - Cleans npm cache after install
  - Removes .next/cache after build
  - Removes node_modules/.cache after build
  - Removes /tmp files after build
  
## Preventing Future Issues

Add to VPS crontab:
```bash
# Clean Docker weekly
0 2 * * 0 docker system prune -a -f >> /home/ubuntu/apps/logs/cleanup.log 2>&1
```

## GitHub Actions Will Auto-Deploy

Once you free up space:
1. Fix should auto-trigger new build in GitHub Actions
2. Or manually trigger: https://github.com/ravehero3/cink/actions
3. Deployment usually takes 5-10 minutes

## Questions?

If build still fails after cleanup, the issue is likely:
1. Disk space still too low (try removing old `docker images`)
2. Network timeout (try retrying from GitHub Actions UI)
3. Database connection (check `.env` file has DATABASE_URL)
