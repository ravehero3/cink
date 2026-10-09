#!/bin/bash

# Health Check Watchdog for UFO SPORT E-Shop
# Monitors https://ufosport.cz every 30 seconds
# Auto-restarts cink container if site is down

set -e

SITE_URL="https://ufosport.cz"
CHECK_INTERVAL=30
MAX_RETRIES=3
RETRY_DELAY=5
LOG_FILE="/tmp/ufosport-watchdog.log"

log_message() {
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" >> "$LOG_FILE"
}

check_site_health() {
  local retry_count=0
  
  while [ $retry_count -lt $MAX_RETRIES ]; do
    # Try to get HTTP 200 response with 10 second timeout
    http_code=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 "$SITE_URL" 2>/dev/null || echo "000")
    
    if [ "$http_code" = "200" ]; then
      return 0  # Site is healthy
    fi
    
    retry_count=$((retry_count + 1))
    if [ $retry_count -lt $MAX_RETRIES ]; then
      sleep $RETRY_DELAY
    fi
  done
  
  return 1  # Site is down
}

restart_container() {
  log_message "⚠️  SITE DOWN! HTTP code: $http_code. Attempting restart..."
  
  cd ~/apps
  
  # Try graceful restart first
  docker compose restart cink 2>/dev/null || {
    log_message "⚠️  Graceful restart failed. Force stopping container..."
    docker ps -a | grep apps-cink | awk '{print $1}' | xargs -r docker rm -f
    docker compose up -d cink
  }
  
  # Wait for container to stabilize
  sleep 10
  
  # Verify recovery
  if check_site_health; then
    log_message "✅ Site recovered! Container restarted successfully."
    return 0
  else
    log_message "❌ Site still down after restart. Manual intervention needed."
    return 1
  fi
}

# Initialize log
log_message "🚀 Watchdog started"

# Main loop
while true; do
  if ! check_site_health; then
    http_code=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 "$SITE_URL" 2>/dev/null || echo "000")
    restart_container
  fi
  
  sleep $CHECK_INTERVAL
done
