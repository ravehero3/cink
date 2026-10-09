FROM node:20-slim

RUN apt-get update -y && apt-get install -y openssl

WORKDIR /app

COPY package*.json ./

# Use npm ci with increased timeout for reliable dependencies
RUN npm config set registry https://registry.npmjs.org && \
    npm config set fetch-timeout 120000 && \
    npm config set fetch-retry-mintimeout 20000 && \
    npm config set fetch-retry-maxtimeout 120000 && \
    npm ci --legacy-peer-deps --ignore-scripts

COPY . .

# Generate Prisma client (skip db check during build)
RUN SKIP_ENV_VALIDATION=true npx prisma generate

# Build Next.js with optimizations
RUN SKIP_ENV_VALIDATION=true npm run build

ENV NODE_OPTIONS="--max-old-space-size=2048"

EXPOSE 5000

HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD curl -f http://localhost:5000 || exit 1

CMD ["sh", "-c", "npx prisma db push && npm run start"]
