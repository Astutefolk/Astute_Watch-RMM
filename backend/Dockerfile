# ---------- BUILD STAGE ----------
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files and install all dependencies (dev + prod)
COPY backend/package*.json ./
RUN npm ci

# Copy source code and Prisma schema
COPY backend/src ./src
COPY backend/prisma ./prisma
COPY backend/tsconfig.json ./

# Build TypeScript
RUN npm run build

# ---------- PRODUCTION STAGE ----------
FROM node:20-alpine

WORKDIR /app

# Copy only production dependencies
COPY backend/package*.json ./
RUN npm ci --omit=dev

# Copy build artifacts and Prisma files from builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma

# Optional: copy .env if you use environment variables
# COPY backend/.env ./

EXPOSE 4000

# Start backend using entrypoint script
CMD ["node", "dist/index.js"]