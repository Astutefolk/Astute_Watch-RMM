#!/bin/bash

# MongoDB Migration Script
cd /opt/rmm/astute-watch/backend

echo "🚀 Starting MongoDB Migration..."

# Step 1: Backup current codebase
echo "📦 Creating backup..."
cp -r src src.backup

# Step 2: Remove Prisma
echo "🗑️  Removing Prisma..."
npm uninstall @prisma/client prisma
rm -rf prisma/

# Step 3: Install Mongoose
echo "📥 Installing Mongoose..."
npm install mongoose

# Step 4: Update .env with MongoDB connection
echo "🔐 Adding MongoDB connection to .env..."
cat >> .env << 'EOF'

# MongoDB
MONGODB_URI=mongodb+srv://joannegulliver01_db_user:bmnVby68xVoTvhjE@cluster0.tqbvg6h.mongodb.net/?appName=Cluster0
EOF

# Step 5: Rebuild
echo "🏗️  Rebuilding..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Build successful!"
else
    echo "❌ Build failed! Checking logs..."
    npm run build 2>&1 | tail -50
    exit 1
fi

# Step 6: Restart services
echo "🔄 Restarting services..."
pm2 delete datto-backend datto-frontend
pm2 start ecosystem.config.js
pm2 save

echo "✅ Migration complete!"
pm2 status
pm2 logs
