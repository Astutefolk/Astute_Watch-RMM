# DATTO RMM Deployment Guide

## VPS Configuration
- **Domain**: joininvite.org
- **IP**: 194.195.87.52
- **OS**: Linux (Alpine preferred for Docker)

## Pre-Deployment Setup

### 1. Point DNS to VPS
Add these DNS records:
```
A record: joininvite.org -> 194.195.87.52
A record: www.joininvite.org -> 194.195.87.52
CNAME: api.joininvite.org -> joininvite.org (optional)
```

### 2. Generate SSL Certificate (Let's Encrypt)
```bash
# Using Certbot
sudo apt-get install certbot python3-certbot-nginx
sudo certbot certonly --standalone -d joininvite.org -d www.joininvite.org

# Or using acme.sh
curl https://get.acme.sh | sh
~/.acme.sh/acme.sh --issue -d joininvite.org -d www.joininvite.org --webroot /var/www/html
```

Copy certificates to your project:
```bash
mkdir -p /opt/rmm/certs
cp /etc/letsencrypt/live/joininvite.org/fullchain.pem /opt/rmm/certs/server.crt
cp /etc/letsencrypt/live/joininvite.org/privkey.pem /opt/rmm/certs/server.key
```

### 3. Setup Environment File
```bash
cd /opt/rmm/Astute_Watch-RMM
cp .env.production.example .env.production

# Edit with your secure values
nano .env.production
```

Update these values:
```
DB_PASSWORD=your_secure_password_here
JWT_SECRET=$(openssl rand -base64 32)
REFRESH_TOKEN_SECRET=$(openssl rand -base64 32)
CORS_ORIGINS=https://joininvite.org,https://www.joininvite.org
```

### 4. Create Docker Network and Volumes
```bash
docker network create datto-network || true
docker volume create postgres_data
docker volume create redis_data
```

### 5. Deploy with Docker Compose
```bash
cd /opt/rmm/Astute_Watch-RMM

# Build and start all services
docker compose --profile production up -d --build

# View logs
docker compose logs -f

# Check specific service
docker compose logs -f datto-backend
docker compose logs -f datto-frontend
docker compose logs -f datto-nginx
```

## DNS Configuration for joininvite.org

Add these records to your DNS provider (Namecheap, GoDaddy, Cloudflare, etc):

| Type | Name | Value |
|------|------|-------|
| A | @ | 194.195.87.52 |
| A | www | 194.195.87.52 |

## SSL Certificate Renewal

Set up auto-renewal with cron:
```bash
crontab -e

# Add this line (renew at 2 AM daily)
0 2 * * * /root/.acme.sh/acme.sh --cron --home /root/.acme.sh && cp /root/.acme.sh/joininvite.org/fullchain.cer /opt/rmm/certs/server.crt && cp /root/.acme.sh/joininvite.org/joininvite.org.key /opt/rmm/certs/server.key && docker restart datto-nginx
```

## Application URLs

Once deployed:
- **Web UI**: https://joininvite.org
- **API**: https://joininvite.org/api/v1
- **WebSocket**: wss://joininvite.org/socket.io

## Troubleshooting

### Check services health
```bash
docker compose ps
```

### View nginx logs
```bash
docker compose logs datto-nginx | tail -50
```

### Access backend logs
```bash
docker compose logs datto-backend | tail -50
```

### Restart services
```bash
docker compose restart

# Or specific service
docker compose restart datto-backend
```

### Remove everything and start fresh
```bash
docker compose down -v
docker compose --profile production up -d --build
```

## Monitoring

### Database backup
```bash
docker compose exec postgres pg_dump -U datto datto_rmm > backup_$(date +%Y%m%d).sql
```

### Check disk usage
```bash
docker system df
```

### Clean up old Docker data
```bash
docker system prune -a
```

## Security Considerations

1. ✅ SSL/TLS enabled
2. ✅ Rate limiting on API (10 req/s)
3. ✅ Rate limiting on auth (5 req/min)
4. ✅ Security headers configured
5. ✅ JWT authentication
6. ✅ API key validation

Change these after deployment:
- `DB_PASSWORD` - Generate secure random password
- `JWT_SECRET` - Generate with `openssl rand -base64 32`
- `REFRESH_TOKEN_SECRET` - Generate with `openssl rand -base64 32`
