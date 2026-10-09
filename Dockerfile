FROM node:20-slim

RUN apt-get update -y && apt-get install -y openssl && apt-get clean && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package*.json ./

# Use npm ci with increased timeout for reliable dependencies
RUN npm config set registry https://registry.npmjs.org && \
    npm config set fetch-timeout 120000 && \
    npm config set fetch-retry-mintimeout 20000 && \
    npm config set fetch-retry-maxtimeout 120000 && \
    npm ci --legacy-peer-deps --ignore-scripts && \
    npm cache clean --force

COPY . .
COPY build.sh ./build.sh
RUN chmod +x ./build.sh

# Build: generate Prisma client and build Next.js (no db operations)
RUN ./build.sh && \
    rm -rf .next/cache && \
    rm -rf node_modules/.cache && \
    rm -rf /tmp/*

ENV NODE_OPTIONS="--max-old-space-size=2048"

EXPOSE 5000

HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD curl -f http://localhost:5000 || exit 1

CMD ["sh", "-c", "npx prisma db push && npm run start"]
