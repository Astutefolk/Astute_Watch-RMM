#!/bin/bash

# DATTO RMM Quick Deploy Script for joininvite.org
# Run this on your VPS to quickly set up the application

set -e

echo "🚀 DATTO RMM Deployment Script"
echo "Domain: joininvite.org"
echo "IP: 194.195.87.52"
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo -e "${YELLOW}Docker not found. Installing Docker...${NC}"
    curl -fsSL https://get.docker.com -o get-docker.sh
    sudo sh get-docker.sh
    rm get-docker.sh
fi

# Check if Docker Compose is installed
if ! command -v docker compose &> /dev/null; then
    echo -e "${YELLOW}Docker Compose not found. Installing...${NC}"
    sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    sudo chmod +x /usr/local/bin/docker-compose
fi

echo -e "${GREEN}✓ Docker and Docker Compose are ready${NC}"

# Create project directory
PROJECT_DIR="/opt/rmm/Astute_Watch-RMM"
if [ ! -d "$PROJECT_DIR" ]; then
    echo -e "${BLUE}Creating project directory...${NC}"
    sudo mkdir -p "$PROJECT_DIR"
fi

# Create certificate directory
echo -e "${BLUE}Setting up certificate directory...${NC}"
sudo mkdir -p "$PROJECT_DIR/certs"
sudo chmod 755 "$PROJECT_DIR/certs"

# Create .env.production if it doesn't exist
if [ ! -f "$PROJECT_DIR/.env.production" ]; then
    echo -e "${BLUE}Creating .env.production...${NC}"
    
    # Generate secure random passwords
    DB_PASS=$(openssl rand -base64 32)
    JWT_SECRET=$(openssl rand -base64 32)
    REFRESH_SECRET=$(openssl rand -base64 32)
    
    sudo tee "$PROJECT_DIR/.env.production" > /dev/null <<EOF
# DATTO RMM Production Configuration
DB_USER=datto
DB_PASSWORD=$DB_PASS
DB_NAME=datto_rmm
NODE_ENV=production
JWT_SECRET=$JWT_SECRET
REFRESH_TOKEN_SECRET=$REFRESH_SECRET
NEXT_PUBLIC_API_URL=/api/v1
NEXT_PUBLIC_WS_URL=
CORS_ORIGINS=https://joininvite.org,https://www.joininvite.org
EOF
    
    echo -e "${GREEN}✓ .env.production created with secure values${NC}"
    echo -e "${YELLOW}  DB_PASSWORD: $DB_PASS${NC}"
else
    echo -e "${YELLOW}⚠ .env.production already exists. Skipping...${NC}"
fi

# Create networks and volumes
echo -e "${BLUE}Creating Docker network and volumes...${NC}"
docker network create datto-network 2>/dev/null || true
docker volume create postgres_data 2>/dev/null || true
docker volume create redis_data 2>/dev/null || true

echo -e "${GREEN}✓ Network and volumes ready${NC}"

# Build and start services
echo -e "${BLUE}Building and starting services...${NC}"
echo -e "${YELLOW}This may take a few minutes...${NC}"

cd "$PROJECT_DIR"
docker compose --profile production up -d --build

# Wait for services to be healthy
echo -e "${BLUE}Waiting for services to be healthy...${NC}"
sleep 10

# Check status
echo ""
echo -e "${GREEN}=== Service Status ===${NC}"
docker compose ps

echo ""
echo -e "${GREEN}✅ Deployment Complete!${NC}"
echo ""
echo -e "${BLUE}Next Steps:${NC}"
echo "1. Update DNS records:"
echo "   A record: joininvite.org -> 194.195.87.52"
echo "   A record: www.joininvite.org -> 194.195.87.52"
echo ""
echo "2. Generate SSL certificate (Let's Encrypt):"
echo "   certbot certonly --standalone -d joininvite.org -d www.joininvite.org"
echo ""
echo "3. Copy certificates:"
echo "   sudo cp /etc/letsencrypt/live/joininvite.org/fullchain.pem $PROJECT_DIR/certs/server.crt"
echo "   sudo cp /etc/letsencrypt/live/joininvite.org/privkey.pem $PROJECT_DIR/certs/server.key"
echo ""
echo "4. Restart nginx:"
echo "   docker compose restart datto-nginx"
echo ""
echo -e "${YELLOW}View logs with:${NC}"
echo "   cd $PROJECT_DIR && docker compose logs -f"
echo ""
echo -e "${YELLOW}Application will be available at:${NC}"
echo "   https://joininvite.org (after DNS and SSL setup)"
