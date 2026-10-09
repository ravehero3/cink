# Health Check Watchdog Setup

## What It Does
- Monitors `https://ufosport.cz` every 30 seconds
- Automatically restarts the `cink` container if site is unreachable
- Logs all checks to `/home/ubuntu/apps/logs/watchdog.log`

## Installation on VPS

### Option 1: Cron Job (Recommended - runs check every 30 seconds)
```bash
# SSH into VPS
ssh ubuntu@130.61.26.156

# Copy watchdog script
cp ~/apps/deploy/healthcheck-watchdog.sh ~/apps/healthcheck-watchdog.sh
chmod +x ~/apps/healthcheck-watchdog.sh

# Add to crontab (runs every minute)
(crontab -l 2>/dev/null; echo "* * * * * /home/ubuntu/apps/healthcheck-watchdog.sh") | crontab -

# Verify cron job
crontab -l
```

### Option 2: Background Service (Advanced)
```bash
# Create systemd service file
sudo tee /etc/systemd/system/ufosport-watchdog.service > /dev/null <<EOF
[Unit]
Description=UFO SPORT Health Check Watchdog
After=docker.service
Wants=docker.service

[Service]
Type=simple
User=ubuntu
ExecStart=/home/ubuntu/apps/healthcheck-watchdog.sh
Restart=always
RestartSec=30
StandardOutput=append:/home/ubuntu/apps/logs/watchdog.log
StandardError=append:/home/ubuntu/apps/logs/watchdog.log

[Install]
WantedBy=multi-user.target
EOF

# Enable and start
sudo systemctl daemon-reload
sudo systemctl enable ufosport-watchdog
sudo systemctl start ufosport-watchdog

# Check status
sudo systemctl status ufosport-watchdog
```

## Monitoring

### View logs in real-time
```bash
tail -f ~/apps/logs/watchdog.log
```

### Check last 50 lines
```bash
tail -50 ~/apps/logs/watchdog.log
```

### Search for failures
```bash
grep "ALERT\|FAILED\|RECOVERY" ~/apps/logs/watchdog.log
```

## What Happens When Site Goes Down

1. **Watchdog detects HTTP code ≠ 200**
2. **Logs alert**: `ALERT: Site unreachable (HTTP 500)`
3. **Attempts graceful restart**: `docker compose restart cink`
4. **Waits 15 seconds** for container to stabilize
5. **Verifies recovery** with another health check
6. **If still down**, logs: `RECOVERY FAILED - Manual intervention required!`

## Manual Test

```bash
# Force a failure (stop container)
docker stop apps-cink-1

# Wait - watchdog should restart it within 1 minute
sleep 60

# Check logs
tail -20 ~/apps/logs/watchdog.log

# Verify site is back up
curl -I https://ufosport.cz
```

## Backup Page Configuration

If the watchdog can't restart the container, users will see:
- Caddy serves `/backup.html` (maintenance page)
- Auto-refreshes every 30 seconds
- Professional message with contact info

To manually serve backup page:
```bash
curl https://ufosport.cz/maintenance
```
