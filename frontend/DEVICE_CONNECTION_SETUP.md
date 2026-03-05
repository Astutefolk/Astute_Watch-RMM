# 📡 DATTO RMM - Device Connection Architecture & Setup

## Overview

Your DATTO RMM system uses an **Agent-Based Architecture** where deployed agents on remote devices connect back to the centralized RMM server. Here's how the complete flow works:

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    DATTO RMM Server                          │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  Frontend (React/Next.js)                              │ │
│  │  ├─ Dashboard                                          │ │
│  │  ├─ Device Management                                 │ │
│  │  ├─ Alert System                                      │ │
│  │  └─ Settings (API Keys)                               │ │
│  └────────────────────────────────────────────────────────┘ │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  Backend (Node.js/Express + Prisma)                   │ │
│  │  ├─ API Endpoints                                     │ │
│  │  ├─ WebSocket Handler                                 │ │
│  │  ├─ Agent Authentication                              │ │
│  │  └─ Device Management                                 │ │
│  └────────────────────────────────────────────────────────┘ │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  Database (PostgreSQL via Prisma)                     │ │
│  │  ├─ Users                                             │ │
│  │  ├─ Devices                                           │ │
│  │  ├─ Alerts                                            │ │
│  │  └─ Agent Credentials                                 │ │
│  └────────────────────────────────────────────────────────┘ │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  Real-time Communication                              │ │
│  │  ├─ WebSocket Server (wss://)                         │ │
│  │  └─ Redis (pub/sub)                                   │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
         ▲                    ▲                    ▲
         │                    │                    │
    WebSocket            REST API            HTTP Polling
         │                    │                    │
         │                    │                    │
┌────────┴────────┬───────────┴────────┬──────────┴────────┐
│                 │                    │                   │
│            Agent (Go)            Agent (Go)         Agent (Go)
│   ┌──────────────────┐   ┌──────────────────┐   ┌──────────────┐
│   │ Windows Device   │   │ Linux Device     │   │ macOS Device │
│   │                  │   │                  │   │              │
│   │ • System Monitor │   │ • System Monitor │   │ • Monitor    │
│   │ • File Mgmt      │   │ • File Mgmt      │   │ • File Mgmt  │
│   │ • Process Mgmt   │   │ • Process Mgmt   │   │ • Processes  │
│   │ • Remote Shell   │   │ • Remote Shell   │   │ • Shell      │
│   │ • Updater        │   │ • Updater        │   │ • Updater    │
│   └──────────────────┘   └──────────────────┘   └──────────────┘
│
└─ Deployed via API Key
```

---

## 🔑 API Key System

### What is an API Key?

An **API Key** is a unique token that identifies an organization and allows agents to:
- Authenticate with the RMM server
- Send device telemetry and metrics
- Receive commands and updates
- Maintain encrypted communication

### Current Flow:

1. **User Registration** → API Key generated and returned
2. **API Key Storage** → Previously shown in alert (NOW REMOVED)
3. **Agent Deployment** → Agent uses API Key to connect
4. **Secure Settings Page** → API Key available in Settings (TO IMPLEMENT)

---

## 🚀 Device Connection Flow

### Step 1: Agent Download & Configuration

```
User Downloads Agent
  ↓
Agent binary (Windows .exe, Linux .bin, macOS .app)
  ↓
User provides:
  • API Key (from Settings page)
  • Server URL (https://joininvite.org)
  • Device name (optional)
  ↓
Agent stores config locally
```

### Step 2: Agent Installation

```
Windows:
  agent.exe install --api-key ABC123 --server https://joininvite.org

Linux:
  sudo ./agent install --api-key ABC123 --server https://joininvite.org

macOS:
  sudo ./agent install --api-key ABC123 --server https://joininvite.org
```

### Step 3: Initial Connection

```
Agent Startup
  ↓
Read stored config
  ↓
Connect to RMM Server (WebSocket or REST)
  ↓
Send Device Registration:
  {
    "api_key": "ABC123",
    "device_name": "MacBook-Pro",
    "os": "darwin",
    "os_version": "14.2",
    "cpu_cores": 8,
    "ram_gb": 16,
    "disk_gb": 512
  }
  ↓
Server validates API key
  ↓
Server creates/updates Device record
  ↓
Agent receives confirmation
  ↓
Agent now online ✅
```

### Step 4: Continuous Communication

```
Agent → Server (Every 30 seconds):
  • CPU usage
  • Memory usage
  • Disk usage
  • Running processes
  • System alerts
  • Network status

Server → Agent (On demand):
  • Execute command
  • File transfer
  • Remote shell session
  • Software update
  • Configuration change
```

---

## 📋 What's Already Set Up

✅ **Backend Architecture:**
- Express.js REST API endpoints
- WebSocket server for real-time communication
- Database schema for devices, users, alerts
- Authentication middleware
- Rate limiting

✅ **Frontend:**
- Dashboard to view devices
- Device management interface
- Alert display system
- Real-time updates

✅ **Agent Framework:**
- Go-based agent in `/agent` directory
- main.go ready for implementation

---

## 🔧 What Still Needs Implementation

### 1. API Key Management

**File:** `backend/src/routes/settings.ts` (needs creation)

```typescript
// Store API key in database
POST /api/v1/organization/api-key/generate
POST /api/v1/organization/api-key/regenerate
GET /api/v1/organization/api-key

// Frontend: Settings page
GET /settings
```

### 2. Agent Registration Endpoint

**File:** `backend/src/routes/device.ts` (needs update)

```typescript
// Agent registration
POST /api/v1/devices/register
Body: {
  api_key: string,
  device_name: string,
  os: string,
  os_version: string,
  cpu_cores: number,
  ram_gb: number,
  disk_gb: number
}
Response: {
  device_id: string,
  ws_url: string,
  polling_interval: number
}
```

### 3. Agent Implementation

**File:** `/agent/main.go` (needs implementation)

Components needed:
```
agent/
├── config/
│   └── config.go          (Load API key & server URL)
├── client/
│   └── websocket.go       (Connect to RMM server)
├── monitor/
│   ├── system.go          (CPU, memory, disk)
│   ├── processes.go       (Monitor processes)
│   └── network.go         (Network monitoring)
├── executor/
│   └── commands.go        (Execute server commands)
├── updater/
│   └── update.go          (Self-update mechanism)
└── main.go                (Entry point)
```

### 4. Device Commands

**File:** `backend/src/routes/device.ts` (needs update)

```typescript
// Execute command on device
POST /api/v1/devices/:id/execute
Body: {
  command: string,
  args: string[]
}

// File operations
GET /api/v1/devices/:id/files
POST /api/v1/devices/:id/files/download
POST /api/v1/devices/:id/files/upload

// Remote shell
WebSocket /api/v1/devices/:id/shell
```

### 5. Settings Page

**File:** `frontend/src/app/settings/page.tsx` (needs creation)

Features:
```
Settings Page
├─ API Key Management
│  ├─ Display current API key (masked)
│  ├─ Copy to clipboard
│  ├─ Regenerate API key
│  └─ Show when API key was generated
├─ Organization Settings
│  ├─ Organization name
│  ├─ Email
│  └─ Timezone
└─ Security
   ├─ Change password
   ├─ Two-factor auth (optional)
   └─ Active sessions
```

---

## 📝 Step-by-Step Setup Guide

### Phase 1: API Key in Settings (SHORT TERM)

1. Create Settings page component
2. Add API key retrieval endpoint
3. Display API key securely with copy button
4. Add regenerate functionality

### Phase 2: Agent Registration (MEDIUM TERM)

1. Create device registration endpoint
2. Build agent connection logic
3. Implement WebSocket handler
4. Add device monitoring

### Phase 3: Agent Commands (LONG TERM)

1. Build command execution API
2. Implement file management
3. Create remote shell interface
4. Add automated tasks

---

## 🔒 Security Considerations

### API Key Security

```
✅ Do:
  • Generate strong random keys
  • Store hashed in database
  • Rotate periodically
  • Limit key scope to organization
  • Log API key usage
  • Regenerate if compromised

❌ Don't:
  • Show plaintext in alerts
  • Commit keys to code
  • Share via unencrypted email
  • Use weak key generation
  • Store in browser localStorage
```

### Agent Communication

```
✅ Security Features:
  • TLS/SSL encryption
  • API key validation
  • Rate limiting per agent
  • Command signing
  • Audit logging
  • Device verification
```

---

## 📊 Implementation Priority

### 🔴 CRITICAL (Do First)
1. Settings page with API key display
2. Device registration endpoint
3. Agent authentication flow

### 🟡 HIGH (Do Soon)
1. System monitoring (CPU, memory, disk)
2. Device online/offline status
3. Alert generation

### 🟢 MEDIUM (Do Later)
1. Remote command execution
2. File management
3. Process management

### 🔵 LOW (Optional)
1. Automated maintenance tasks
2. Advanced reporting
3. Custom integrations

---

## 🧪 Testing the Setup

### 1. Test API Key Endpoint

```bash
# Generate new API key
curl -X GET http://localhost:3000/api/v1/organization/api-key \
  -H "Authorization: Bearer YOUR_TOKEN"

# Response:
{
  "api_key": "sk_org_abc123xyz789",
  "created_at": "2026-03-05T10:00:00Z",
  "organization_id": "org_123"
}
```

### 2. Test Device Registration

```bash
# Register a device
curl -X POST http://localhost:3000/api/v1/devices/register \
  -H "Content-Type: application/json" \
  -d '{
    "api_key": "sk_org_abc123xyz789",
    "device_name": "MacBook-Pro",
    "os": "darwin",
    "os_version": "14.2",
    "cpu_cores": 8,
    "ram_gb": 16,
    "disk_gb": 512
  }'

# Response:
{
  "device_id": "dev_123",
  "device_name": "MacBook-Pro",
  "status": "online",
  "registered_at": "2026-03-05T10:05:00Z"
}
```

### 3. Test WebSocket Connection

```bash
# Connect agent WebSocket
wscat -c wss://joininvite.org/api/v1/devices/dev_123/stream \
  -H "X-API-Key: sk_org_abc123xyz789"

# Should receive telemetry data continuously
```

---

## 📚 Next Steps

1. **Immediate:** Create Settings page → Show API key securely
2. **Short-term:** Implement device registration endpoint
3. **Medium-term:** Build agent monitoring capabilities
4. **Long-term:** Add command execution and advanced features

---

## 🎯 Questions to Consider

1. Do you want API keys to have expiration dates?
2. Should agents auto-update or require manual updates?
3. Do you need end-to-end encryption for sensitive operations?
4. Should devices group by location/department?
5. Do you need offline queuing for commands?

---

**The architecture is sound - now it's about implementing the pieces! Ready to start with the Settings page?** 🚀
