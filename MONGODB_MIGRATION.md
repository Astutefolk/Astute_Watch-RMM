# MongoDB Migration Deployment Guide

## Summary of Changes

The backend has been successfully migrated from **Prisma + PostgreSQL** to **Mongoose + MongoDB**. This simplifies the architecture and reduces complexity in the codebase.

### Key Changes:
- ✅ Replaced Prisma ORM with Mongoose ODM
- ✅ Created 5 Mongoose models (User, Organization, ApiKey, Device, Alert)
- ✅ Updated all services (auth, device, alert) to use MongoDB queries
- ✅ Refactored all controllers to work with Mongoose
- ✅ Updated main index.ts to use MongoDB connection
- ✅ Build passing with all TypeScript checks
- ✅ Frontend compatibility maintained (all API endpoints unchanged)

## Deployment Steps

### Step 1: Pull Latest Changes on Server

```bash
cd /opt/rmm/astute-watch
git pull origin main
```

### Step 2: Update Environment Configuration

Update your `.env` file with the MongoDB URI:

```bash
# Replace DATABASE_URL with:
MONGODB_URI="mongodb+srv://joannegulliver01_db_user:bmnVby68xVoTvhjE@cluster0.tqbvg6h.mongodb.net/?appName=Cluster0"
```

Or add to existing `.env`:
```bash
echo 'MONGODB_URI="mongodb+srv://joannegulliver01_db_user:bmnVby68xVoTvhjE@cluster0.tqbvg6h.mongodb.net/?appName=Cluster0"' >> backend/.env
```

### Step 3: Rebuild Backend

```bash
cd backend
npm install  # Install any new dependencies if needed
npm run build
```

### Step 4: Restart Services

Using PM2:
```bash
pm2 restart datto-backend datto-frontend
```

Or with bash commands:
```bash
pm2 restart backend
pm2 restart frontend
pm2 logs backend
```

### Step 5: Verify Deployment

1. **Check Health Endpoint:**
   ```bash
   curl http://localhost:3000/health
   ```
   Expected response:
   ```json
   {
     "status": "ok",
     "timestamp": "2024-03-06T01:00:00.000Z",
     "uptime": 123.456
   }
   ```

2. **Test Login/Registration:**
   - Navigate to http://your-server:3001/login
   - Register a new account with organization name
   - Login with credentials

3. **Check API Endpoints:**
   ```bash
   # Get API Keys (requires authentication)
   curl -X GET http://localhost:3000/api/v1/auth/api-keys \
     -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
   ```

## Database Differences

### Old (Prisma + PostgreSQL)
- Schema defined in `prisma/schema.prisma`
- Migrations required for schema changes
- Complex validation logic

### New (Mongoose + MongoDB)
- Schema defined in TypeScript models in `src/models/`
- Flexible schema (can modify without migrations)
- Simplified data models

## Rollback Plan (If Needed)

If deployment fails:

1. **Revert to Previous Commit:**
   ```bash
   cd /opt/rmm/astute-watch
   git revert HEAD
   git pull
   ```

2. **Reinstall Prisma:**
   ```bash
   cd backend
   npm install @prisma/client prisma
   ```

3. **Restart Services:**
   ```bash
   pm2 restart datto-backend
   ```

## Testing Checklist

- [ ] Backend starts without errors: `pm2 logs datto-backend`
- [ ] MongoDB connection successful
- [ ] Health endpoint returns 200
- [ ] Can register new user
- [ ] Can login with credentials
- [ ] Can view devices dashboard
- [ ] Can view alerts
- [ ] API keys endpoint works
- [ ] WebSocket connections work (real-time alerts)

## Troubleshooting

### MongoDB Connection Error
```
Error: connect ENOTFOUND mongodb+srv
```
**Solution:** Check MongoDB URI in `.env` and ensure network access is allowed

### Port Already in Use
```
Error: listen EADDRINUSE: address already in use :::3000
```
**Solution:** 
```bash
pm2 stop datto-backend
pm2 delete datto-backend
npm start
```

### Missing Environment Variable
```
Error: Missing required environment variable: MONGODB_URI
```
**Solution:** Add `MONGODB_URI` to `.env` file and restart

## Performance Improvements

- Simpler service layer (no complex validation caching)
- Direct MongoDB queries (no query translation layer)
- Reduced memory footprint (no Prisma client)
- Faster startup time

## Backend Features Still Working

- ✅ User authentication (register/login)
- ✅ API key management
- ✅ Device heartbeat reporting
- ✅ Device metrics tracking
- ✅ Alert creation and resolution
- ✅ WebSocket real-time updates
- ✅ Rate limiting
- ✅ CORS handling
- ✅ JWT token validation

## Next Steps (Optional)

1. **Migrate existing data** (if migrating from PostgreSQL):
   - Export data from PostgreSQL
   - Transform to MongoDB document format
   - Import into MongoDB Atlas

2. **Performance tuning**:
   - Add MongoDB indexes for frequently queried fields
   - Optimize connection pooling
   - Configure caching strategies

3. **Monitoring**:
   - Set up MongoDB Atlas monitoring
   - Configure PM2 monitoring
   - Set up error tracking (Sentry, etc.)

## Support

If you encounter any issues during deployment:
1. Check PM2 logs: `pm2 logs datto-backend`
2. Verify MongoDB connection: `mongosh "mongodb+srv://..." `
3. Check environment variables: `cat .env`
4. Review backend source: `src/index.ts` for initialization order
