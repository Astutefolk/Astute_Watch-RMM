# Quick Reference - joininvite.org Deployment

## Your Setup Details
```
Domain: joininvite.org
VPS IP: 194.195.87.52
Project Path: /opt/rmm/Astute_Watch-RMM
```

## One-Time Setup Commands

### 1. SSH into your VPS
```bash
ssh root@194.195.87.52
```

### 2. Download and run deployment script
```bash
cd /opt/rmm/Astute_Watch-RMM
chmod +x deploy.sh
sudo ./deploy.sh
```

### 3. Setup SSL Certificate (Do this AFTER DNS propagates)
```bash
# Install Certbot
sudo apt-get update
sudo apt-get install certbot

# Generate certificate
sudo certbot certonly --standalone -d joininvite.org -d www.joininvite.org

# Copy to your project
sudo mkdir -p /opt/rmm/Astute_Watch-RMM/certs
sudo cp /etc/letsencrypt/live/joininvite.org/fullchain.pem /opt/rmm/Astute_Watch-RMM/certs/server.crt
sudo cp /etc/letsencrypt/live/joininvite.org/privkey.pem /opt/rmm/Astute_Watch-RMM/certs/server.key
sudo chown -R 1000:1000 /opt/rmm/Astute_Watch-RMM/certs

# Restart nginx container
cd /opt/rmm/Astute_Watch-RMM && docker compose restart datto-nginx
```

### 4. Point DNS Records
In your DNS provider (Namecheap, GoDaddy, Cloudflare, etc):
```
Type: A
Name: @
Value: 194.195.87.52
TTL: 3600

Type: A
Name: www
Value: 194.195.87.52
TTL: 3600
```

## Daily Operations

### View logs
```bash
cd /opt/rmm/Astute_Watch-RMM
docker compose logs -f datto-backend
docker compose logs -f datto-frontend
docker compose logs -f datto-nginx
```

### Check service status
```bash
docker compose ps
```

### Restart services
```bash
docker compose restart datto-backend
docker compose restart datto-frontend
docker compose restart datto-nginx
```

### Update environment variables
```bash
nano /opt/rmm/Astute_Watch-RMM/.env.production
# Make changes, then:
docker compose up -d
```

### View API health
```bash
curl https://joininvite.org/api/v1/health
```

## Database Operations

### Backup database
```bash
cd /opt/rmm/Astute_Watch-RMM
docker compose exec postgres pg_dump -U datto datto_rmm > backup_$(date +%Y%m%d_%H%M%S).sql
```

### Restore database
```bash
docker compose exec -T postgres psql -U datto datto_rmm < backup_20260305_120000.sql
```

### Access database CLI
```bash
docker compose exec postgres psql -U datto -d datto_rmm
```

## Troubleshooting

### Services won't start
```bash
# Check logs
docker compose logs

# Rebuild everything
docker compose down -v
docker compose --profile production up -d --build
```

### SSL Certificate issues
```bash
# Check certificate expiry
openssl x509 -in /opt/rmm/Astute_Watch-RMM/certs/server.crt -text -noout | grep -A 2 "Validity"

# Renew certificate
sudo certbot renew --force-renewal
# Then copy again:
sudo cp /etc/letsencrypt/live/joininvite.org/fullchain.pem /opt/rmm/Astute_Watch-RMM/certs/server.crt
sudo cp /etc/letsencrypt/live/joininvite.org/privkey.pem /opt/rmm/Astute_Watch-RMM/certs/server.key
docker compose restart datto-nginx
```

### High disk usage
```bash
# Clean up Docker
docker system prune -a

# Check specific volume
docker system df
```

### Port already in use
```bash
# Check what's using port 443
sudo lsof -i :443

# Free up port (if needed)
sudo systemctl stop nginx apache2
```

## Access After Deployment

- **Web UI**: https://joininvite.org
- **API Base**: https://joininvite.org/api/v1
- **WebSocket**: wss://joininvite.org/socket.io
- **Status**: https://joininvite.org/health

## File Locations

```
/opt/rmm/Astute_Watch-RMM/
├── .env.production          # Environment variables
├── docker-compose.yml       # Service definitions
├── nginx.conf              # Nginx configuration
├── certs/                  # SSL certificates
│   ├── server.crt
│   └── server.key
├── backend/                # Backend source
├── frontend/               # Frontend source
└── agent/                  # Agent source
```

## Emergency Commands

### Stop all services
```bash
docker compose down
```

### Remove all data and start fresh
```bash
docker compose down -v
docker volume rm postgres_data redis_data
docker compose --profile production up -d --build
```

### Get shell access to container
```bash
docker compose exec datto-backend sh
docker compose exec datto-frontend sh
docker compose exec postgres sh
```

## Security Notes

- ✅ All communication is HTTPS
- ✅ Database password auto-generated and in .env.production
- ✅ JWT secrets auto-generated
- ✅ Rate limiting enabled
- ✅ CORS configured for joininvite.org only
- ⚠️ Keep .env.production file private!
- ⚠️ Use strong database password
- ⚠️ Rotate JWT secrets periodically
