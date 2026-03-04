#!/bin/bash
# DATTO RMM - Quick Start Script
# Automates local development setup

set -e

echo "🛡️  DATTO RMM - Quick Start Setup"
echo "=================================="
echo ""

# Check prerequisites
echo "✓ Checking prerequisites..."

if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+."
    exit 1
fi

if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker."
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose."
    exit 1
fi

echo "✅ Node.js $(node --version)"
echo "✅ Docker $(docker --version)"
echo "✅ Docker Compose $(docker-compose --version)"
echo ""

# Setup environment
echo "📝 Setting up environment..."
if [ -f ".env" ]; then
    echo "⚠️  .env already exists. Skipping..."
else
    cp .env.example .env
    echo "✅ Created .env file"
fi

# Generate secure secrets
JWT_SECRET=$(openssl rand -base64 32)
REFRESH_SECRET=$(openssl rand -base64 32)

# Update .env with generated secrets
sed -i.bak "s/JWT_SECRET=.*/JWT_SECRET=$JWT_SECRET/" .env 2>/dev/null || sed -i '' "s/JWT_SECRET=.*/JWT_SECRET=$JWT_SECRET/" .env
sed -i.bak "s/REFRESH_TOKEN_SECRET=.*/REFRESH_TOKEN_SECRET=$REFRESH_SECRET/" .env 2>/dev/null || sed -i '' "s/REFRESH_TOKEN_SECRET=.*/REFRESH_TOKEN_SECRET=$REFRESH_SECRET/" .env
rm -f .env.bak

echo "✅ Generated secure secrets"
echo ""

# Start Docker services
echo "🐳 Starting Docker services..."
docker-compose up -d
echo "✅ Services started"
echo ""

# Wait for services to be healthy
echo "⏳ Waiting for services to be ready..."
sleep 10

# Run database migrations
echo "📊 Running database migrations..."
docker-compose exec -T backend npm run build || true
docker-compose exec -T backend npx prisma migrate deploy
echo "✅ Database ready"
echo ""

# Display access information
echo "✅ Setup complete!"
echo ""
echo "╔════════════════════════════════════════════════════════╗"
echo "║        DATTO RMM - Local Development Ready            ║"
echo "╠════════════════════════════════════════════════════════╣"
echo "║ Frontend:  http://localhost:3001                       ║"
echo "║ Backend:   http://localhost:3000                       ║"
echo "║ Database:  postgresql://datto:password@localhost:5432  ║"
echo "║ Redis:     redis://localhost:6379                      ║"
echo "╚════════════════════════════════════════════════════════╝"
echo ""
echo "Next steps:"
echo "1. Open http://localhost:3001 in your browser"
echo "2. Register a new account"
echo "3. Save your API key"
echo "4. Install an agent: agent -key YOUR_API_KEY"
echo ""
echo "To view logs:"
echo "  docker-compose logs -f backend"
echo "  docker-compose logs -f frontend"
echo ""
echo "To stop services:"
echo "  docker-compose down"
echo ""
