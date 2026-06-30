FROM node:20-slim

RUN apt-get update -y && apt-get install -y openssl

WORKDIR /app

COPY package*.json ./

RUN npm config set registry https://registry.npmjs.org && npm ci --legacy-peer-deps --ignore-scripts

COPY . .

RUN npx prisma generate

RUN npx next build

ENV NODE_OPTIONS="--max-old-space-size=2048"

EXPOSE 5000

CMD ["sh", "-c", "npx prisma db push && npm run start"]
