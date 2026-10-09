#!/bin/bash

# UFO SPORT Health Check Watchdog
# Install as: 0 * * * * /home/ubuntu/apps/healthcheck-watchdog.sh
# Or run continuously in background

SITE_URL="https://ufosport.cz"
CONTAINER_NAME="apps-cink-1"
LOG_FILE="/home/ubuntu/apps/logs/watchdog.log"
APPS_DIR="/home/ubuntu/apps"

# Create log directory if it doesn't exist
mkdir -p "$(dirname "$LOG_FILE")"

log() {
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" >> "$LOG_FILE"
}

check_health() {
  # Try to reach the site with 15 second timeout
  http_code=$(curl -s -o /dev/null -w "%{http_code}" --connect-timeout 10 --max-time 15 "$SITE_URL" 2>/dev/null)
  
  if [ "$http_code" = "200" ]; then
    return 0  # Healthy
  fi
  
  return 1  # Unhealthy
}

get_container_status() {
  docker ps --filter "name=$CONTAINER_NAME" --filter "status=running" --quiet
}

restart_service() {
  log "⚠️  HEALTH CHECK FAILED (HTTP $http_code) - Attempting restart..."
  
  cd "$APPS_DIR" || {
    log "❌ Failed to cd to $APPS_DIR"
    return 1
  }
  
  # Try docker compose restart first
  if docker compose restart cink 2>> "$LOG_FILE"; then
    log "✅ Container restart initiated"
    sleep 15  # Wait for container to stabilize
    
    # Verify health
    if check_health; then
      log "✅ RECOVERY SUCCESSFUL - Site is back online"
      return 0
    fi
  fi
  
  # If restart failed, try force restart
  log "⚠️  Graceful restart failed - attempting force restart"
  
  if docker ps -a | grep -q "$CONTAINER_NAME"; then
    docker stop "$CONTAINER_NAME" 2>> "$LOG_FILE" || true
    docker rm "$CONTAINER_NAME" 2>> "$LOG_FILE" || true
  fi
  
  if docker compose up -d cink 2>> "$LOG_FILE"; then
    log "✅ Container force restart initiated"
    sleep 20
    
    if check_health; then
      log "✅ RECOVERY SUCCESSFUL (force restart) - Site is back online"
      return 0
    fi
  fi
  
  log "❌ RECOVERY FAILED - Manual intervention required!"
  return 1
}

# Main health check
if ! check_health; then
  log "ALERT: Site unreachable (HTTP $http_code)"
  
  # Only attempt restart if container exists
  if get_container_status > /dev/null; then
    restart_service
  else
    log "❌ Container not running - cannot restart"
  fi
else
  # Only log successful checks every 10 checks (reduce log spam)
  if [ $((RANDOM % 10)) -eq 0 ]; then
    log "✅ Health check passed"
  fi
fi
