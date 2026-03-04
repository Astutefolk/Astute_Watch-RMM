@echo off
REM DATTO RMM - Quick Start Script (Windows)
REM Automates local development setup

echo.
echo ===================================
echo 🛡️  DATTO RMM - Quick Start Setup
echo ===================================
echo.

REM Check Docker
where docker >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ Docker is not installed or not in PATH
    exit /b 1
)

echo ✅ Docker found
echo.

REM Setup environment
echo 📝 Setting up environment...
if exist ".env" (
    echo ⚠️  .env already exists. Skipping...
) else (
    copy .env.example .env >nul
    echo ✅ Created .env file
)

echo.

REM Start Docker services
echo 🐳 Starting Docker services...
docker-compose up -d
echo ✅ Services started
echo.

REM Wait for services
echo ⏳ Waiting 10 seconds for services to be ready...
timeout /t 10 /nobreak

REM Run database migrations
echo 📊 Running database migrations...
docker-compose exec -T backend npm run build
docker-compose exec -T backend npx prisma migrate deploy
echo ✅ Database ready
echo.

REM Display access information
echo ✅ Setup complete!
echo.
echo ╔════════════════════════════════════════════════════════╗
echo ║        DATTO RMM - Local Development Ready            ║
echo ╠════════════════════════════════════════════════════════╣
echo ║ Frontend:  http://localhost:3001                       ║
echo ║ Backend:   http://localhost:3000                       ║
echo ║ Database:  postgresql://datto:password@localhost:5432  ║
echo ║ Redis:     redis://localhost:6379                      ║
echo ╚════════════════════════════════════════════════════════╝
echo.
echo Next steps:
echo 1. Open http://localhost:3001 in your browser
echo 2. Register a new account
echo 3. Save your API key
echo 4. Install an agent: agent -key YOUR_API_KEY
echo.
echo To view logs:
echo   docker-compose logs -f backend
echo   docker-compose logs -f frontend
echo.
echo To stop services:
echo   docker-compose down
echo.
