# Complete Fresh VPS Deployment Guide for DATTO RMM

**VPS Details:**
- IP: `194.195.87.52`
- Domain: `joininvite.org`
- OS: Ubuntu/Debian (fresh install)

---

## Step 1: Initial Server Setup

### 1.1 Connect to VPS
```bash
ssh root@194.195.87.52
```

### 1.2 Update System
```bash
apt update && apt upgrade -y
```

### 1.3 Install Docker and Docker Compose
```bash
# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Add user to docker group
sudo usermod -aG docker $USER
newgrp docker

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Verify installation
docker --version
docker-compose --version
```

### 1.4 Install Git
```bash
apt install -y git
```

### 1.5 Create Project Directory
```bash
mkdir -p /opt/rmm
cd /opt/rmm
```

---

## Step 2: Clone Repository and Setup

### 2.1 Clone the GitHub Repository
```bash
git clone https://github.com/Astutefolk/Astute_Watch-RMM.git astute-watch
cd astute-watch
```

### 2.2 Create Environment File
```bash
cat > .env << 'EOF'
# Database
DB_USER=datto
DB_PASSWORD=GenerateRandomPassword123!
DB_NAME=datto_rmm

# Backend
NODE_ENV=production
JWT_SECRET=GenerateRandomJWTSecret123456789!
REFRESH_TOKEN_SECRET=GenerateRandomRefreshSecret123456789!
CORS_ORIGINS=https://joininvite.org

# Frontend
NEXT_PUBLIC_API_URL=https://joininvite.org/api/v1
NEXT_PUBLIC_WS_URL=wss://joininvite.org
EOF
```

**⚠️ IMPORTANT:** Generate strong random passwords:
```bash
# Generate random passwords
openssl rand -base64 32  # For DB_PASSWORD
openssl rand -base64 32  # For JWT_SECRET
openssl rand -base64 32  # For REFRESH_TOKEN_SECRET
```

Replace the values above with these generated passwords.

---

## Step 3: SSL Certificate Setup (Let's Encrypt)

### 3.1 Install Certbot
```bash
apt install -y certbot python3-certbot-nginx
```

### 3.2 Create Certs Directory
```bash
mkdir -p /opt/rmm/astute-watch/certs
cd /opt/rmm/astute-watch
```

### 3.3 Generate SSL Certificate
```bash
# Make sure ports 80 and 443 are open
sudo ufw allow 22,80,443/tcp

# Generate certificate (standalone mode - no nginx running yet)
sudo certbot certonly --standalone \
  --non-interactive \
  --agree-tos \
  --email admin@joininvite.org \
  -d joininvite.org \
  -d www.joininvite.org

# Copy certificates to project directory
sudo cp /etc/letsencrypt/live/joininvite.org/fullchain.pem ./certs/
sudo cp /etc/letsencrypt/live/joininvite.org/privkey.pem ./certs/
sudo chown -R 1000:1000 ./certs/
```

---

## Step 4: DNS Configuration (Do This at Your Domain Registrar)

Add these DNS A records:
- **Host:** `@` | **Type:** A | **Value:** `194.195.87.52`
- **Host:** `www` | **Type:** A | **Value:** `194.195.87.52`

Wait 5-15 minutes for DNS to propagate. Verify with:
```bash
nslookup joininvite.org
```

---

## Step 5: Start Docker Services

### 5.1 Build and Start All Services
```bash
cd /opt/rmm/astute-watch

# Start with production profile (includes nginx)
docker compose --profile production up -d --build

# Monitor logs
docker compose logs -f
```

### 5.2 Wait for Services to Start
```bash
# Check service health
docker compose ps

# Expected output:
# datto-postgres - healthy
# datto-redis - healthy
# datto-backend - healthy (may take a minute)
# datto-frontend - healthy
# datto-nginx - running
```

---

## Step 6: Verify Deployment

### 6.1 Test HTTP to HTTPS Redirect
```bash
curl -I http://joininvite.org
# Should return: HTTP/1.1 301 Moved Permanently
# Location: https://joininvite.org/
```

### 6.2 Test HTTPS Connection
```bash
curl -I https://joininvite.org
# Should return: HTTP/2 200
```

### 6.3 Test CSS/JS Files
```bash
curl -I https://joininvite.org/_next/static/chunks/main.js
# Should return: HTTP/2 200 with Content-Type: application/javascript

curl -I https://joininvite.org/_next/static/ 
# Should return: HTTP/2 200
```

### 6.4 Test API Endpoint
```bash
curl -I https://joininvite.org/api/v1/health
# Should return: HTTP/2 200
```

### 6.5 Test WebSocket
```bash
curl -I https://joininvite.org/socket.io/?EIO=4&transport=polling
# Should return: HTTP/2 200
```

---

## Step 7: Verify in Browser

1. Open browser: `https://joininvite.org`
2. Verify:
   - ✅ Page loads without errors
   - ✅ All CSS styling displays correctly
   - ✅ Images and fonts render properly
   - ✅ No console errors in DevTools
   - ✅ SSL certificate is valid (padlock icon)

---

## Step 8: Database Initialization (If Needed)

### 8.1 Run Prisma Migrations
```bash
docker compose exec backend npm run prisma:generate
docker compose exec backend npm run prisma:migrate:deploy
```

### 8.2 Create Admin User (If Applicable)
```bash
# Check your backend setup for user creation commands
docker compose exec backend npm run seed  # If seed script exists
```

---

## Step 9: SSL Certificate Auto-Renewal

### 9.1 Setup Auto-Renewal
```bash
# Test renewal process
sudo certbot renew --dry-run

# Create renewal timer (automatic)
sudo systemctl enable certbot.timer
sudo systemctl start certbot.timer

# Verify timer is active
sudo systemctl status certbot.timer
```

### 9.2 Configure Docker to Reload Nginx After Renewal
```bash
cat > /opt/rmm/astute-watch/renewal-hook.sh << 'EOF'
#!/bin/bash
cd /opt/rmm/astute-watch
docker compose exec nginx nginx -s reload
EOF

chmod +x /opt/rmm/astute-watch/renewal-hook.sh

# Add to certbot renewal hooks
sudo ln -s /opt/rmm/astute-watch/renewal-hook.sh /etc/letsencrypt/renewal-hooks/post/docker-reload.sh
```

---

## Step 10: Useful Maintenance Commands

### View Logs
```bash
# All services
docker compose logs -f

# Specific service
docker compose logs -f backend
docker compose logs -f frontend
docker compose logs -f nginx

# Recent logs (last 50 lines)
docker compose logs --tail 50
```

### Restart Services
```bash
# Restart all
docker compose restart

# Restart specific service
docker compose restart backend
docker compose restart frontend
docker compose restart nginx
```

### Stop/Start
```bash
# Stop
docker compose --profile production down

# Start
docker compose --profile production up -d
```

### Update Project
```bash
cd /opt/rmm/astute-watch
git pull
docker compose --profile production up -d --build
```

### Database Backup
```bash
docker compose exec postgres pg_dump -U datto datto_rmm > backup-$(date +%Y%m%d-%H%M%S).sql
```

### Database Restore
```bash
docker compose exec -T postgres psql -U datto datto_rmm < backup-file.sql
```

---

## Troubleshooting

### CSS/JS Not Loading (404 Errors)
```bash
# Check frontend build
docker compose exec frontend ls -la /app/.next/static/

# Check nginx config
docker compose exec nginx nginx -t

# Reload nginx
docker compose exec nginx nginx -s reload
```

### Backend Unhealthy
```bash
# Check backend logs
docker compose logs backend --tail 100

# Check database connection
docker compose exec backend wget --spider http://localhost:3000/health -v
```

### Database Connection Issues
```bash
# Check database is running
docker compose ps postgres

# Test connection
docker compose exec postgres psql -U datto -d datto_rmm -c "SELECT 1;"
```

### SSL Certificate Issues
```bash
# Check certificate validity
sudo certbot certificates

# Force renewal (if needed)
sudo certbot renew --force-renewal
```

### Port Already in Use
```bash
# Find process using port 80/443
sudo lsof -i :80
sudo lsof -i :443

# Kill process if needed
sudo kill -9 <PID>
```

---

## Security Recommendations

1. **Change default credentials** - Update all passwords in `.env`
2. **Setup firewall** - Only allow ports 22, 80, 443
   ```bash
   sudo ufw default deny incoming
   sudo ufw default allow outgoing
   sudo ufw allow 22/tcp
   sudo ufw allow 80/tcp
   sudo ufw allow 443/tcp
   sudo ufw enable
   ```

3. **Setup monitoring** - Configure alerts for your services
4. **Regular backups** - Backup database weekly
5. **Monitor disk space** - Ensure adequate storage for logs and data
6. **Update regularly** - Keep Docker images updated
   ```bash
   docker pull postgres:16-alpine
   docker pull redis:7-alpine
   docker pull node:20-alpine
   docker pull nginx:alpine
   ```

---

## Quick Reference

| Task | Command |
|------|---------|
| View all logs | `docker compose logs -f` |
| Restart nginx | `docker compose restart nginx` |
| Check service health | `docker compose ps` |
| Rebuild and restart | `docker compose --profile production up -d --build` |
| Stop everything | `docker compose --profile production down` |
| SSH to VPS | `ssh root@194.195.87.52` |
| Test URL | `curl -I https://joininvite.org` |

---

## Support

If services don't start, check:
1. Docker daemon running: `docker ps`
2. Ports available: `sudo lsof -i :80; sudo lsof -i :443`
3. Logs: `docker compose logs --tail 100`
4. SSL certs exist: `ls -la certs/`
5. DNS resolved: `nslookup joininvite.org`
