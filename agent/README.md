# DATTO Agent - Windows Service Installation

## Overview

The DATTO Agent is a lightweight Go binary that runs on Windows systems to collect and send system metrics to the RMM backend.

## Build

### Windows
```bash
go build -o datto-agent.exe main.go
```

### Linux/macOS
```bash
GOOS=linux GOARCH=amd64 go build -o datto-agent main.go
```

Or use the build scripts:
```bash
# Windows
build.bat

# Linux/macOS
chmod +x build.sh
./build.sh
```

## Installation

### Windows

#### Option 1: Manual Execution
```bash
datto-agent.exe -key YOUR_API_KEY -api http://localhost:3000/api/v1
```

#### Option 2: Windows Service (Recommended)

1. Download and install [NSSM (Non-Sucking Service Manager)](https://nssm.cc)

2. Install the service:
```bash
nssm install "DATTO Agent" "C:\path\to\datto-agent.exe" "-key YOUR_API_KEY -api http://your-rmm.com/api/v1"
```

3. Start the service:
```bash
nssm start "DATTO Agent"
```

4. Check status:
```bash
nssm status "DATTO Agent"
```

5. View logs:
```bash
nssm log "DATTO Agent" stdout C:\Logs\datto-agent.log
```

### Linux

1. Run directly:
```bash
./datto-agent -key YOUR_API_KEY -api http://localhost:3000/api/v1
```

2. Or as systemd service:
```bash
sudo cp datto-agent /usr/local/bin/
sudo chmod +x /usr/local/bin/datto-agent

# Create systemd service file
sudo cat > /etc/systemd/system/datto-agent.service << EOF
[Unit]
Description=DATTO RMM Agent
After=network.target

[Service]
Type=simple
User=root
ExecStart=/usr/local/bin/datto-agent -key YOUR_API_KEY -api http://localhost:3000/api/v1
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF

sudo systemctl daemon-reload
sudo systemctl enable datto-agent
sudo systemctl start datto-agent
```

## Command Line Options

```
-key string
    API Key (required)
    
-api string
    API URL (default: "http://localhost:3000/api/v1")
    
-interval int
    Heartbeat interval in seconds (default: 30)
    
-device string
    Device ID (auto-generated using hostname if not provided)
```

## Metrics Collected

The agent collects the following metrics every 30 seconds:

- **CPU Usage**: Current CPU percentage (0-100%)
- **RAM Usage**: Memory usage percentage
- **Disk Usage**: Disk space usage percentage (C: drive on Windows)
- **OS Version**: Operating system version and kernel information

## Security

- **API Key Authentication**: All requests include the API key in X-API-Key header
- **HTTPS Support**: Communicates over HTTPS with the backend
- **Secure by Default**: Can skip SSL verification for self-signed certificates in development

## Troubleshooting

### Connection Failed
- Ensure backend API is running and accessible
- Check API URL is correct
- Verify firewall allows outbound connections to API

### Metrics Not Updating
- Check agent is running: `nssm status "DATTO Agent"`
- Check logs for errors
- Verify API key is valid

### High CPU Usage
- Increase heartbeat interval: `-interval 60`
- Check for other processes consuming resources

## Performance

- Lightweight (single binary, minimal overhead)
- Low memory footprint (~10-20MB)
- Can be deployed on thousands of endpoints
- Graceful shutdown on SIGTERM
