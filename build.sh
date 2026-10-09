#!/bin/bash
# Build script for Docker - skips database operations
set -e
npx prisma generate
npx next build
