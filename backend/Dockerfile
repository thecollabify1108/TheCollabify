# Stage 1: Build
FROM node:20-slim AS builder

WORKDIR /app

# Install dependencies first (for caching)
COPY package*.json ./
RUN npm ci

# Copy source and generate Prisma client
COPY . .
RUN npx prisma generate

# Stage 2: Runtime
FROM node:20-slim

WORKDIR /app

# Install production dependencies only
COPY package*.json ./
RUN npm ci --only=production

# Copy built assets and required files
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=builder /app/server.js ./
COPY --from=builder /app/socketServer.js ./
COPY --from=builder /app/config ./config
COPY --from=builder /app/middleware ./middleware
COPY --from=builder /app/routes ./routes
COPY --from=builder /app/services ./services
COPY --from=builder /app/utils ./utils
COPY --from=builder /app/prisma ./prisma

# Environment defaults
ENV NODE_ENV=production
ENV PORT=5000

EXPOSE 5000

# Start the server
CMD ["node", "server.js"]
