# DATTO RMM - Complete Setup Guide

## Table of Contents

1. [Project Overview](#project-overview)
2. [Local Development Setup](#local-development-setup)
3. [Docker Deployment](#docker-deployment)
4. [Production Deployment](#production-deployment)
5. [Agent Installation](#agent-installation)
6. [API Documentation](#api-documentation)
7. [Troubleshooting](#troubleshooting)
8. [Security Best Practices](#security-best-practices)

---

## Project Overview

DATTO RMM is a production-ready Remote Monitoring and Management platform featuring:

- **Multi-tenant architecture** with complete data isolation
- **Real-time monitoring** via WebSocket connections
- **Lightweight Windows/Linux/macOS agents** written in Go
- **Role-based access control** (Admin, Technician)
- **Automated alert system** for CPU, RAM, Disk, and offline devices
- **RESTful API** with JWT authentication
- **Real-time dashboards** built with Next.js 14

### Tech Stack

| Component | Technology |
|-----------|------------|
| Backend | Node.js + Express + TypeScript |
| Database | PostgreSQL |
| Cache | Redis |
| Frontend | Next.js 14 + React + TailwindCSS |
| Real-time | WebSocket (Socket.io) |
| Agent | Go 1.21 |
| Container | Docker + Docker Compose |

---

## Local Development Setup

### Prerequisites

- Node.js 18+ and npm
- Go 1.21+
- Docker and Docker Compose (optional)
- PostgreSQL 16+
- Redis 7+
- Git

### Step 1: Clone Repository

```bash
git clone https://github.com/your-org/datto-rmm.git
cd datto-rmm
```

### Step 2: Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Update .env with your local settings
# Important: Set JWT_SECRET and REFRESH_TOKEN_SECRET to random values
openssl rand -base64 32  # Generate random key

# Run database migrations
npx prisma migrate dev --name init

# Seed database (optional)
npx prisma db seed

# Start backend (development mode with auto-reload)
npm run dev
```

Backend runs on: `http://localhost:3000`

### Step 3: Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# .env contents:
# NEXT_PUBLIC_API_URL=http://localhost:3000/api/v1
# NEXT_PUBLIC_WS_URL=http://localhost:3000

# Start frontend (development mode)
npm run dev
```

Frontend runs on: `http://localhost:3001`

### Step 4: Build Agent (Optional)

```bash
cd agent

# Build for current platform
go build -o datto-agent main.go

# Test agent
./datto-agent -help
```

### Step 5: Access Application

1. Open browser: `http://localhost:3001`
2. Register new account with organization name
3. Save the displayed API key (only shown once)
4. Use API key to run agents

---

## Docker Deployment

### Quick Start (All Services)

```bash
# Copy environment file
cp .env.example .env

# Update .env with your configuration
vi .env

# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Service Status

```bash
# Check health
docker-compose ps

# View specific service logs
docker-compose logs backend
docker-compose logs frontend
docker-compose logs postgres
docker-compose logs redis
```

### Database Migrations

```bash
# Run migrations inside container
docker-compose exec backend npx prisma migrate deploy

# View database
docker-compose exec postgres psql -U datto -d datto_rmm
```

### Reset Database

```bash
# Remove volumes (WARNING: Deletes data)
docker-compose down -v

# Recreate and migrate
docker-compose up -d
docker-compose exec backend npx prisma migrate deploy
```

---

## Production Deployment

### Pre-deployment Checklist

- [ ] Update `JWT_SECRET` and `REFRESH_TOKEN_SECRET` with secure random values
- [ ] Configure `CORS_ORIGINS` with your domain
- [ ] Set `NODE_ENV=production`
- [ ] Configure SSL/TLS certificates
- [ ] Set up database backups
- [ ] Configure monitoring and logging
- [ ] Review security settings

### Deploy with Docker Compose

```bash
# 1. Prepare environment
cp .env.example .env
# Edit .env with production values
vi .env

# 2. Build images (if custom changes)
docker-compose build

# 3. Start with production profile (includes Nginx)
docker-compose --profile production up -d

# 4. Check health
curl https://your-domain.com/health

# 5. View logs
docker-compose logs -f nginx
```

### Kubernetes Deployment (Optional)

Create `k8s/backend-deployment.yaml`:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: datto-backend
spec:
  replicas: 3
  selector:
    matchLabels:
      app: datto-backend
  template:
    metadata:
      labels:
        app: datto-backend
    spec:
      containers:
      - name: backend
        image: datto-rmm-backend:latest
        ports:
        - containerPort: 3000
        env:
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: datto-secrets
              key: database_url
        - name: JWT_SECRET
          valueFrom:
            secretKeyRef:
              name: datto-secrets
              key: jwt_secret
        livenessProbe:
          httpGet:
            path: /health
            port: 3000
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /health
            port: 3000
          initialDelaySeconds: 10
          periodSeconds: 5
---
apiVersion: v1
kind: Service
metadata:
  name: datto-backend
spec:
  selector:
    app: datto-backend
  ports:
  - port: 80
    targetPort: 3000
  type: LoadBalancer
```

Deploy with Kubernetes:

```bash
# Create secrets
kubectl create secret generic datto-secrets \
  --from-literal=database_url="postgresql://..." \
  --from-literal=jwt_secret="$(openssl rand -base64 32)"

# Deploy
kubectl apply -f k8s/backend-deployment.yaml
```

### SSL/TLS Configuration

```bash
# Generate self-signed certificate (development only)
openssl req -x509 -newkey rsa:4096 -keyout key.pem -out cert.pem -days 365 -nodes

# For production, use Let's Encrypt with Certbot
certbot certonly --standalone -d your-domain.com
```

---

## Agent Installation

### Windows

#### Download Latest Release

```bash
# Download binary from GitHub releases
# Extract to: C:\Program Files\DATTO\

# Get your API key from dashboard
```

#### Option 1: Command Line

```bash
cd "C:\Program Files\DATTO\"

# Run with API key
datto-agent.exe -key "key_your_api_key_here" -api "https://your-rmm.com/api/v1"
```

#### Option 2: Windows Service (Recommended)

```bash
# Download NSSM: https://nssm.cc

nssm install "DATTO Agent" "C:\Program Files\DATTO\datto-agent.exe" `
  "-key key_your_api_key_here -api https://your-rmm.com/api/v1"

nssm start "DATTO Agent"

# Verify
nssm status "DATTO Agent"
```

#### Uninstall Service

```bash
nssm stop "DATTO Agent"
nssm remove "DATTO Agent" confirm
```

### Linux

```bash
# Build from source
cd agent
./build.sh

# Copy to system
sudo cp dist/datto-agent-linux /usr/local/bin/datto-agent
sudo chmod +x /usr/local/bin/datto-agent

# Create systemd service
sudo tee /etc/systemd/system/datto-agent.service << EOF
[Unit]
Description=DATTO RMM Agent
After=network.target

[Service]
Type=simple
User=root
ExecStart=/usr/local/bin/datto-agent -key key_your_api_key_here -api https://your-rmm.com/api/v1
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF

# Enable and start
sudo systemctl daemon-reload
sudo systemctl enable datto-agent
sudo systemctl start datto-agent

# Check status
sudo systemctl status datto-agent
```

### Bulk Deployment

#### PowerShell Script (Windows)

```powershell
# deploy-agents.ps1
param(
    [string]$ApiKey,
    [string]$ApiUrl,
    [string[]]$Computers
)

foreach ($computer in $Computers) {
    Invoke-Command -ComputerName $computer -ScriptBlock {
        param($key, $url)
        
        # Copy agent
        Copy-Item "\\fileserver\datto-agent.exe" "C:\Program Files\DATTO\"
        
        # Install service
        nssm install "DATTO Agent" "C:\Program Files\DATTO\datto-agent.exe" `
          "-key $key -api $url"
        
        nssm start "DATTO Agent"
    } -ArgumentList $ApiKey, $ApiUrl
}
```

Usage:

```powershell
.\deploy-agents.ps1 -ApiKey "key_..." -ApiUrl "https://rmm.com/api/v1" `
  -Computers "PC1", "PC2", "PC3"
```

---

## API Documentation

### Authentication

All authenticated endpoints require JWT token in Authorization header:

```bash
Authorization: Bearer YOUR_JWT_TOKEN
```

### Endpoints

#### Auth

```bash
# Register
POST /api/v1/auth/register
Content-Type: application/json

{
  "email": "admin@company.com",
  "password": "SecurePass123",
  "organizationName": "My Company"
}

# Response includes apiKey (save this!)
{
  "accessToken": "eyJ...",
  "refreshToken": "eyJ...",
  "apiKey": "key_abc123xyz...",
  "user": {
    "userId": "user_123",
    "email": "admin@company.com",
    "orgId": "org_123"
  }
}

# Login
POST /api/v1/auth/login
{
  "email": "admin@company.com",
  "password": "SecurePass123"
}

# Get current user
GET /api/v1/auth/me
```

#### Devices

```bash
# List devices
GET /api/v1/devices?page=1&limit=10

# Get device details
GET /api/v1/devices/{id}

# Delete device
DELETE /api/v1/devices/{id}

# Get device stats
GET /api/v1/devices/stats

# Get dashboard
GET /api/v1/devices/dashboard

# Agent heartbeat (X-API-Key header)
POST /api/v1/devices/heartbeat
X-API-Key: key_abc123...
Content-Type: application/json

{
  "deviceId": "DESKTOP-ABC123",
  "cpu": 45.2,
  "ram": 62.8,
  "disk": 78.1,
  "osVersion": "Windows 11 Professional (22621)"
}
```

#### Alerts

```bash
# List alerts
GET /api/v1/alerts?page=1&limit=10&unresolved=true

# Get alert details
GET /api/v1/alerts/{id}

# Resolve alert
PATCH /api/v1/alerts/{id}/resolve

# Get alert stats
GET /api/v1/alerts/stats
```

### WebSocket Events

Connect to WebSocket at `/socket.io/` with JWT token.

#### Client Events (emit)

```javascript
// Subscribe to device updates
socket.emit('subscribe:device', 'device_id_here');

// Unsubscribe from device
socket.emit('unsubscribe:device', 'device_id_here');

// Heartbeat
socket.emit('ping');
```

#### Server Events (listen)

```javascript
// Connection established
socket.on('connected', (data) => {
  console.log(data.message);
});

// Device metrics update
socket.on('device:metrics', (data) => {
  const { deviceId, metrics, timestamp } = data;
  console.log(`Device ${deviceId}: CPU ${metrics.cpu}%`);
});

// Device status change
socket.on('device:status', (data) => {
  const { deviceId, isOnline, timestamp } = data;
  console.log(`Device ${deviceId} is now ${isOnline ? 'online' : 'offline'}`);
});

// New alert
socket.on('alert:created', (alert) => {
  console.log(`Alert: ${alert.message}`);
});

// Pong response
socket.on('pong', () => {
  console.log('Pong received');
});
```

---

## Troubleshooting

### Backend Won't Start

```bash
# Check if ports are in use
lsof -i :3000  # macOS/Linux
netstat -ano | findstr :3000  # Windows

# Check database connection
psql postgresql://user:password@localhost:5432/datto_rmm

# Check Redis connection
redis-cli ping

# View logs
npm run dev  # See console output
docker-compose logs backend  # Docker
```

### Frontend Can't Connect to Backend

```bash
# Verify backend is running
curl http://localhost:3000/health

# Check CORS configuration
# Frontend expects: CORS_ORIGINS=http://localhost:3001

# Check API URL in frontend env
cat frontend/.env | grep NEXT_PUBLIC_API_URL

# Clear browser cache and restart
```

### Agent Not Connecting

```bash
# Test connectivity from device
curl -X POST http://your-api.com/api/v1/devices/heartbeat \
  -H "X-API-Key: key_your_key" \
  -H "Content-Type: application/json" \
  -d '{"deviceId":"test","cpu":50,"ram":50,"disk":50}'

# Check agent logs (Windows Service)
nssm log "DATTO Agent" stdout C:\Logs\agent.log

# Verify API key is correct
# Get from dashboard: Settings > API Keys
```

### High Memory Usage

- Reduce agent heartbeat interval: `-interval 60`
- Reduce metrics retention in database
- Scale Redis with persistence: `appendonly no`

### Database Growth

```bash
# Archive old metrics
DELETE FROM device_metrics 
WHERE timestamp < NOW() - INTERVAL '90 days';

# Vacuum database
VACUUM ANALYZE;

# Check table sizes
SELECT schemaname, tablename, 
       pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) 
FROM pg_tables 
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

---

## Security Best Practices

### Environment Variables

```bash
# ✅ Good
export JWT_SECRET="$(openssl rand -base64 32)"
export REFRESH_TOKEN_SECRET="$(openssl rand -base64 32)"

# ❌ Bad - Never commit secrets
JWT_SECRET="debug_key_123"
```

### API Keys

- Store API keys securely (use secrets manager)
- Rotate periodically
- Use least-privilege principle
- Never expose in logs

### Database

```bash
# Use strong passwords
PostgreSQL password: $(openssl rand -base64 20)

# Enable SSL/TLS connections
SSL=require in connection string

# Regular backups
pg_dump datto_rmm > backup.sql

# Monitor queries
EXPLAIN ANALYZE SELECT ...
```

### Frontend

- Set `Secure` and `HttpOnly` flags on cookies
- Implement CSRF protection
- Validate all user input
- Use CSP headers

### Deployment

- Use HTTPS/TLS (Let's Encrypt)
- Keep dependencies updated: `npm audit`
- Use firewall rules
- Implement rate limiting
- Monitor and log all requests
- Regular security audits

### Agent Security

- Use HTTPS for agent communications
- Validate API key format
- Implement request signing
- Monitor agent activity
- Disable telemetry if not needed

---

## Support & Contributing

- **Issues**: GitHub Issues
- **Documentation**: See ARCHITECTURE.md
- **Contributing**: Pull requests welcome

## License

MIT License - See LICENSE file
