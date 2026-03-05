FROM node:20-alpine3.19 AS deps

WORKDIR /app

# Install dependencies
COPY frontend/package*.json ./
RUN npm ci

# Build stage
FROM node:20-alpine3.19 AS builder

WORKDIR /app

# Update base image to patch known vulnerabilities
RUN apk update && apk upgrade && rm -rf /var/cache/apk/*

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules

# Copy source and config
COPY frontend/src ./src
COPY frontend/tsconfig.json frontend/next.config.js frontend/tailwind.config.ts ./
COPY frontend/package*.json ./

# Create public directory for Next.js static files
RUN mkdir -p /app/public

# Set build-time environment variables
ARG NEXT_PUBLIC_API_URL=/api/v1
ARG NEXT_PUBLIC_WS_URL=
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_WS_URL=$NEXT_PUBLIC_WS_URL

# Build Next.js
RUN npm run build

# Production stage
FROM node:20-alpine3.19

WORKDIR /app

# Install runtime dependencies only
COPY frontend/package*.json ./
RUN npm ci --omit=dev

# Copy built application from builder
COPY --from=builder /app/.next ./.next
RUN mkdir -p /app/public
COPY --from=builder /app/node_modules ./node_modules

# Set production environment
ENV NODE_ENV=production

EXPOSE 3001

HEALTHCHECK --interval=30s --timeout=10s --start-period=10s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost:3001 || exit 1

CMD ["npm", "start"]
