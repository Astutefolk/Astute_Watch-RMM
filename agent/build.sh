#!/bin/bash
# Build script for DATTO Agent

echo "Building DATTO Agent..."

# Create dist directory
mkdir -p dist

# Build for Windows x64
GOOS=windows GOARCH=amd64 go build -o dist/datto-agent.exe -ldflags="-s -w" main.go

if [ $? -ne 0 ]; then
    echo "Build failed!"
    exit 1
fi

# Build for Linux x64
GOOS=linux GOARCH=amd64 go build -o dist/datto-agent-linux -ldflags="-s -w" main.go

# Build for macOS x64
GOOS=darwin GOARCH=amd64 go build -o dist/datto-agent-macos -ldflags="-s -w" main.go

echo "Build complete!"
echo "  - Windows: dist/datto-agent.exe"
echo "  - Linux:   dist/datto-agent-linux"
echo "  - macOS:   dist/datto-agent-macos"

echo ""
echo "Usage:"
echo "  ./datto-agent -key YOUR_API_KEY -api http://localhost:3000/api/v1"
echo ""
echo "To run as systemd service on Linux:"
echo "  sudo ./datto-agent -key YOUR_API_KEY &"
