#!/bin/bash
# Build script for Docker - skips database operations
set -e

# Set dummy DATABASE_URL for build to prevent PrismaClient errors
export DATABASE_URL="postgresql://dummy:dummy@localhost/dummy"

npx prisma generate
npx next build
