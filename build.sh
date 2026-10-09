#!/bin/bash
# Build script for Docker - skips database operations
npx prisma generate && next build
