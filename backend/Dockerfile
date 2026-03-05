# ---------- BUILD STAGE ----------
FROM node:20-alpine AS builder

WORKDIR /app

# Install build dependencies including OpenSSL for Prisma
RUN apk add --no-cache openssl python3 make g++

# Copy package files and install all dependencies (dev + prod)
COPY backend/package*.json ./
RUN npm ci

# Copy source code and Prisma schema
COPY backend/src ./src
COPY backend/prisma ./prisma
COPY backend/tsconfig.json ./

# Generate Prisma client
RUN npm run prisma:generate

# Build TypeScript
RUN npm run build

# ---------- PRODUCTION STAGE ----------
FROM node:20-alpine

WORKDIR /app

# Install runtime dependencies including OpenSSL for Prisma
RUN apk add --no-cache openssl

# Copy only production dependencies
COPY backend/package*.json ./
RUN npm ci --omit=dev

# Generate Prisma client in production
COPY backend/prisma ./prisma
RUN npm run prisma:generate

# Copy build artifacts from builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma

# Optional: copy .env if you use environment variables
# COPY backend/.env ./

EXPOSE 4000

# Start backend using entrypoint script
CMD ["node", "dist/index.js"]
CMD ["node", "dist/index.js"]