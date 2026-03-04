@echo off
REM Build script for DATTO Agent
REM Builds Windows executable

setlocal enabledelayedexpansion

echo Building DATTO Agent...

REM Build for Windows x64
set GOOS=windows
set GOARCH=amd64
go build -o dist\datto-agent.exe -ldflags "-s -w" main.go

if errorlevel 1 (
    echo Build failed!
    exit /b 1
)

echo Build complete! Output: dist\datto-agent.exe

REM Display usage
echo.
echo Usage:
echo   datto-agent.exe -key YOUR_API_KEY -api http://localhost:3000/api/v1
echo.
echo To run as Windows Service, use NSSM:
echo   nssm install "DATTO Agent" "C:\path\to\datto-agent.exe" "-key YOUR_API_KEY"
echo   nssm start "DATTO Agent"
