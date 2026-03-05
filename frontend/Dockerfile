FROM node:20-alpine3.19 AS base

WORKDIR /app

# Update base image to patch known vulnerabilities
RUN apk update && apk upgrade && rm -rf /var/cache/apk/*

# Install dependencies
COPY frontend/package*.json ./
RUN npm ci

# Copy source
COPY frontend/src ./src
COPY frontend/public ./public
COPY frontend/tsconfig.json frontend/next.config.js frontend/tailwind.config.ts ./

# Set build-time environment variables (these are baked into the build)
ARG NEXT_PUBLIC_API_URL=http://localhost:3000/api/v1
ARG NEXT_PUBLIC_WS_URL=http://localhost:3000
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_WS_URL=$NEXT_PUBLIC_WS_URL

# Build Next.js
RUN npm run build

EXPOSE 3001

HEALTHCHECK --interval=30s --timeout=10s --start-period=10s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost:3001 || exit 1

CMD ["npm", "start"]
