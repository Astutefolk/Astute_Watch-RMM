# DATTO RMM - System Architecture

## High-Level Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                          CLIENTS LAYER                                   │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                           │
│  ┌─────────────────────────┐         ┌──────────────────────────────┐   │
│  │  Web Dashboard          │         │   Windows Agent (Go)         │   │
│  │  Next.js 14             │         │                              │   │
│  │  - TailwindCSS          │         │  - System Metrics Collector  │   │
│  │  - Shadcn UI            │         │  - Heartbeat (30s)           │   │
│  │  - Zustand State Mgmt   │         │  - HTTPS Communication       │   │
│  │  - WebSocket Client     │         │  - API Key Auth              │   │
│  └─────────────────────────┘         └──────────────────────────────┘   │
│                                                                           │
└────────────────┬────────────────────────────────────────┬────────────────┘
                 │                                        │
                 │ HTTP/HTTPS REST API                    │ HTTPS Metrics
                 │ WebSocket (WSS)                        │
                 │                                        │
┌────────────────▼────────────────────────────────────────▼────────────────┐
│                        API GATEWAY (Nginx/Reverse Proxy)                 │
│                      Rate Limiting | CORS | TLS/SSL                       │
└────────────────┬─────────────────────────────────────────────────────────┘
                 │
┌────────────────▼─────────────────────────────────────────────────────────┐
│                          BACKEND SERVICES LAYER                          │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                           │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │           Express.js API Server (Node.js)                       │   │
│  │  ┌─────────────────┐  ┌──────────────┐  ┌────────────────────┐ │   │
│  │  │ Auth Routes     │  │ Device API   │  │ Alert Routes       │ │   │
│  │  │ - Register      │  │ - GET/POST   │  │ - GET Alerts       │ │   │
│  │  │ - Login         │  │ - DELETE     │  │ - CREATE Alert     │ │   │
│  │  │ - Refresh Token │  │ - Details    │  │ - Real-time Push   │ │   │
│  │  │ - JWT Validation│  │ - Metrics    │  │ - Webhook Support  │ │   │
│  │  └─────────────────┘  └──────────────┘  └────────────────────┘ │   │
│  │  ┌─────────────────────────────────────────────────────────────┐ │   │
│  │  │ Middleware Stack                                            │ │   │
│  │  │ - Helmet (Security Headers)                                 │ │   │
│  │  │ - Express Rate Limit                                        │ │   │
│  │  │ - Compression                                               │ │   │
│  │  │ - CORS                                                      │ │   │
│  │  │ - Request Validation                                        │ │   │
│  │  │ - JWT Auth                                                  │ │   │
│  │  └─────────────────────────────────────────────────────────────┘ │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                           │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │           WebSocket Server (Socket.io)                          │   │
│  │  - Real-time Device Updates                                    │   │
│  │  - Live CPU/RAM/Disk Updates                                   │   │
│  │  - Alert Notifications                                         │   │
│  │  - Namespace-based Isolation (per Organization)                │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                           │
└──────┬───────────────────────┬───────────────────────┬──────────────────┘
       │                       │                       │
       │ SQL Queries           │ Cache Operations      │ Message Queue
       │                       │                       │
┌──────▼──────────┐   ┌────────▼─────────┐   ┌───────▼─────────────┐
│                 │   │                  │   │                     │
│  PostgreSQL DB  │   │  Redis Cache     │   │  Message Queue      │
│                 │   │  - Device Stats  │   │  (Optional/Future)  │
│  ┌───────────┐  │   │  - User Sessions │   │                     │
│  │ Users     │  │   │  - Rate Limits   │   │  - Alert Events     │
│  ├───────────┤  │   │  - Real-time Pub │   │  - Device Events    │
│  │ Orgs      │  │   │    Sub           │   │                     │
│  ├───────────┤  │   └──────────────────┘   └─────────────────────┘
│  │ Devices   │  │
│  ├───────────┤  │
│  │ Metrics   │  │
│  ├───────────┤  │
│  │ Alerts    │  │
│  ├───────────┤  │
│  │ API Keys  │  │
│  └───────────┘  │
│                 │
└─────────────────┘

```

## Data Flow Diagrams

### 1. Agent Heartbeat Flow
```
┌─────────────────┐
│   Windows Agent │
└────────┬────────┘
         │
         │ Every 30 seconds:
         │ 1. Collect System Metrics
         │ 2. Create JSON Payload
         │ 3. Sign with API Key
         │
         ▼
┌──────────────────────────────────────┐
│ HTTPS POST /api/v1/metrics/heartbeat │
│ Headers: Authorization, API-Key      │
│ Body: {cpu, ram, disk, timestamp}    │
└────────┬─────────────────────────────┘
         │
         ▼
┌────────────────────────────────┐
│ Backend API - Rate Limiter     │
│ (1 req per 10 sec per agent)   │
└────────┬───────────────────────┘
         │
         ▼
┌────────────────────────────────┐
│ Validate API Key + Device      │
│ Extract Organization ID        │
└────────┬───────────────────────┘
         │
         ├─► Redis: Update Device Last Seen
         │
         ├─► PostgreSQL: Insert/Update Metrics
         │
         ├─► Check Alert Conditions
         │   (CPU > 85%, RAM > 90%)
         │
         ├─► If Alert: Create Alert Record
         │
         └─► WebSocket: Broadcast to Connected Clients
             (via Redis Pub/Sub)
             
         ▼
┌──────────────────────────────────┐
│ Return 200 OK                    │
│ {deviceId, nextHeartbeatInterval}│
└──────────────────────────────────┘
```

### 2. User Dashboard Real-Time Updates
```
┌──────────────────┐
│  Browser Client  │
│  (Next.js App)   │
└────────┬─────────┘
         │
         │ 1. Initial Load
         ▼
  ┌─────────────────────┐
  │ REST API: GET /api/ │
  │   devices           │
  └────────┬────────────┘
           │
           ├─► Fetch Initial State
           │
           ▼
  ┌──────────────────────────────┐
  │ Render Dashboard with Data   │
  │ Zustand State Store          │
  └───────┬──────────────────────┘
          │
          │ 2. WebSocket Connection
          ▼
  ┌─────────────────────┐
  │ Connect to WSS://   │
  │ /socket.io          │
  │ Auth: JWT Token     │
  └────────┬────────────┘
           │
           │ Listen on Events:
           ├─► device:metrics (live updates)
           ├─► device:online/offline
           ├─► alert:created
           └─► alert:resolved
           
           ▼
  ┌────────────────────────────────┐
  │ Update Zustand Store           │
  │ (no page refresh needed)        │
  │ Real-time CPU/RAM/Disk updates │
  └────────────────────────────────┘
```

### 3. Authentication & Authorization Flow
```
┌─────────────────────────┐
│  User (Email/Password)  │
└────────┬────────────────┘
         │
         ▼
┌──────────────────────────────────┐
│ POST /api/auth/register          │
│ Body: {email, password, orgName} │
└────────┬─────────────────────────┘
         │
         ├─► Validate Input
         ├─► Check Email Uniqueness
         ├─► Hash Password (bcrypt)
         ├─► Create Organization
         ├─► Create User + API Key
         └─► Return {userId, orgId, apiKey}
         
         ▼
         
         User performs login:
         
┌──────────────────────────────────┐
│ POST /api/auth/login             │
│ Body: {email, password}          │
└────────┬─────────────────────────┘
         │
         ├─► Find User
         ├─► Compare Bcrypt Hash
         ├─► Generate JWT Token
         │   (exp: 15 min)
         ├─► Generate Refresh Token
         │   (exp: 7 days)
         └─► Store Refresh Token in Redis
         
         ▼
         
┌──────────────────────────────────┐
│ Return Tokens                    │
│ {accessToken, refreshToken}      │
│ HttpOnly Cookie + Bearer Header  │
└──────────────────────────────────┘
         
         ▼
         
         Authenticated Requests:
         
┌──────────────────────────────────┐
│ All API Requests                 │
│ Header: Authorization: Bearer JWT│
└────────┬─────────────────────────┘
         │
         ├─► Verify JWT Signature
         ├─► Check Expiration
         ├─► Extract userId + orgId
         ├─► Check User Role (Admin/Tech)
         ├─► Verify Resource Ownership
         │   (user belongs to org)
         └─► Process Request
         
         ▼
         
┌──────────────────────────────────┐
│ Return Data (filtered by org)    │
└──────────────────────────────────┘
```

## Multi-Tenancy Architecture

```
┌──────────────────────────────────────────────┐
│            Organization Isolation             │
│                                               │
│  ┌────────────────────────────────────────┐  │
│  │ Organization: Acme Corp               │  │
│  │ OrgId: org_123                         │  │
│  │ ApiKey: key_acme_...                   │  │
│  │                                        │  │
│  │ ┌────────────────┐  ┌────────────────┐│  │
│  │ │ User: Admin    │  │ Device: Server1││  │
│  │ │ Role: Admin    │  │ Status: Online ││  │
│  │ │                │  │ Metrics: ...   ││  │
│  │ └────────────────┘  └────────────────┘│  │
│  │                                        │  │
│  │ ┌────────────────┐  ┌────────────────┐│  │
│  │ │ User: Tech     │  │ Device: Server2││  │
│  │ │ Role: Tech     │  │ Status: Offline││  │
│  │ │                │  │ Metrics: None  ││  │
│  │ └────────────────┘  └────────────────┘│  │
│  └────────────────────────────────────────┘  │
│                                               │
│  ┌────────────────────────────────────────┐  │
│  │ Organization: Beta Corp                │  │
│  │ OrgId: org_456                         │  │
│  │ ApiKey: key_beta_...                   │  │
│  │                                        │  │
│  │ ┌────────────────┐  ┌────────────────┐│  │
│  │ │ User: Manager  │  │ Device: PC1    ││  │
│  │ │ Role: Admin    │  │ Status: Online ││  │
│  │ │                │  │ Metrics: ...   ││  │
│  │ └────────────────┘  └────────────────┘│  │
│  └────────────────────────────────────────┘  │
│                                               │
│  Data strictly isolated by orgId             │
│  Row-level security via Prisma filters       │
│  WebSocket rooms per organization            │
│  Cache keys namespaced by orgId              │
│                                               │
└──────────────────────────────────────────────┘
```

## Database Schema Overview

```
┌─────────────────────┐
│ organizations       │
├─────────────────────┤
│ id (PK)             │
│ name                │
│ createdAt           │
│ updatedAt           │
└─────────────────────┘
        │
        │ 1:N
        ▼
┌─────────────────────┐
│ users               │
├─────────────────────┤
│ id (PK)             │
│ email               │
│ passwordHash        │
│ role (ADMIN|TECH)   │
│ orgId (FK)          │
│ createdAt           │
└─────────────────────┘

┌─────────────────────┐
│ apiKeys             │
├─────────────────────┤
│ id (PK)             │
│ key (unique)        │
│ name                │
│ orgId (FK)          │
│ isActive            │
│ createdAt           │
└─────────────────────┘

┌─────────────────────┐        ┌──────────────────┐
│ devices             │◄─────┤ deviceMetrics    │
├─────────────────────┤ 1:N  ├──────────────────┤
│ id (PK)             │       │ id (PK)          │
│ deviceId (unique)   │       │ deviceId (FK)    │
│ name                │       │ cpu              │
│ osVersion          │       │ ram              │
│ lastSeen            │       │ disk             │
│ isOnline            │       │ timestamp        │
│ orgId (FK)          │       │ createdAt        │
│ createdAt           │       └──────────────────┘
└─────────────────────┘

┌──────────────────┐
│ alerts           │
├──────────────────┤
│ id (PK)          │
│ type             │
│ severity         │
│ deviceId (FK)    │
│ orgId (FK)       │
│ message          │
│ isResolved       │
│ createdAt        │
│ resolvedAt       │
└──────────────────┘
```

## Security Layers

```
┌────────────────────────────────────────────────────────────────┐
│                    SECURITY LAYERS                             │
├────────────────────────────────────────────────────────────────┤
│                                                                 │
│ Layer 1: Transport Security                                    │
│  └─ HTTPS/TLS 1.3                                             │
│  └─ WSS (Secure WebSocket)                                    │
│  └─ HSTS Headers                                              │
│                                                                 │
│ Layer 2: API Gateway Security                                  │
│  └─ Rate Limiting (IP-based, User-based)                      │
│  └─ DDoS Protection (Nginx limits)                            │
│  └─ CORS Policy Enforcement                                   │
│  └─ Request Size Limits                                       │
│                                                                 │
│ Layer 3: Application Security                                  │
│  └─ Helmet.js (Security Headers)                              │
│  └─ CSRF Protection (if needed)                               │
│  └─ Input Validation & Sanitization                           │
│  └─ SQL Injection Prevention (Prisma parameterized)           │
│  └─ XSS Prevention (React escaping)                           │
│                                                                 │
│ Layer 4: Authentication                                        │
│  └─ JWT Tokens (15 min TTL)                                   │
│  └─ Refresh Tokens (7 days, Redis stored)                     │
│  └─ API Key Authentication (for agents)                       │
│  └─ Device ID Validation                                      │
│                                                                 │
│ Layer 5: Authorization                                         │
│  └─ Role-Based Access Control (RBAC)                          │
│  └─ Row-Level Security (orgId filtering)                      │
│  └─ Resource Ownership Verification                           │
│  └─ Device-User Org Relationship Check                        │
│                                                                 │
│ Layer 6: Data Protection                                       │
│  └─ Bcrypt Password Hashing (10 rounds)                       │
│  └─ API Keys Hashed (SHA256)                                  │
│  └─ Sensitive Data Encryption (PII)                           │
│  └─ Database Connection Pooling + SSL                         │
│                                                                 │
│ Layer 7: Monitoring & Auditing                                 │
│  └─ Request Logging                                           │
│  └─ Failed Auth Tracking                                      │
│  └─ Alert History Audit Trail                                 │
│  └─ API Key Usage Logging                                     │
│                                                                 │
└────────────────────────────────────────────────────────────────┘
```

## Deployment Architecture (Production-Ready)

```
┌────────────────────────────────────────────────────────────────┐
│                    CLOUD DEPLOYMENT                             │
├────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                    CDN / Edge Layer                       │  │
│  │              (Cloudflare / CloudFront)                   │  │
│  │            Static Assets, Caching, DDoS                  │  │
│  └────┬─────────────────────────────────────────────────────┘  │
│       │                                                         │
│  ┌────▼─────────────────────────────────────────────────────┐  │
│  │              Load Balancer (Nginx/HAProxy)               │  │
│  │         SSL/TLS Termination, Auto Scaling                │  │
│  └────┬─────────────────────────────────────────────────────┘  │
│       │                                                         │
│  ┌────┴────────────────────────────────────────────────────┐   │
│  │    Kubernetes Cluster (or Docker Swarm)                 │   │
│  │                                                           │   │
│  │  ┌──────────────────────┐  ┌──────────────────────┐    │   │
│  │  │ Node 1               │  │ Node 2               │    │   │
│  │  │ ┌────────────────┐   │  │ ┌────────────────┐   │    │   │
│  │  │ │ API Pod #1     │   │  │ │ API Pod #2     │   │    │   │
│  │  │ │ Express Server │   │  │ │ Express Server │   │    │   │
│  │  │ └────────────────┘   │  │ └────────────────┘   │    │   │
│  │  │ ┌────────────────┐   │  │ ┌────────────────┐   │    │   │
│  │  │ │ WebSocket Pod #1   │  │ │ WebSocket Pod #2   │    │   │
│  │  │ └────────────────┘   │  │ └────────────────┘   │    │   │
│  │  └──────────────────────┘  └──────────────────────┘    │   │
│  │                                                           │   │
│  │  ┌──────────────────────┐  ┌──────────────────────┐    │   │
│  │  │ Node 3               │  │ Node 4               │    │   │
│  │  │ ┌────────────────┐   │  │ ┌────────────────┐   │    │   │
│  │  │ │ Redis Pod      │   │  │ │ Redis Pod      │   │    │   │
│  │  │ │ (Master)       │   │  │ │ (Replica)      │   │    │   │
│  │  │ └────────────────┘   │  │ └────────────────┘   │    │   │
│  │  └──────────────────────┘  └──────────────────────┘    │   │
│  │                                                           │   │
│  └───────────────────┬────────────────────────────────────┘   │
│                      │                                         │
│  ┌───────────────────┴──────────────────────────────────┐    │
│  │         Persistent Data Layer                        │    │
│  │                                                       │    │
│  │  ┌────────────────────┐   ┌────────────────────┐   │    │
│  │  │ PostgreSQL Primary │   │ PostgreSQL Replica │   │    │
│  │  │ (RDS)              │   │ (RDS Read Replica) │   │    │
│  │  │ - Main Database    │   │ - Read-only        │   │    │
│  │  │ - PITR Backups     │   │ - Analytics        │   │    │
│  │  │ - Encryption       │   │ - HA Failover      │   │    │
│  │  └────────────────────┘   └────────────────────┘   │    │
│  │                                                       │    │
│  │  ┌────────────────────┐   ┌────────────────────┐   │    │
│  │  │ Redis Cache Cluster│   │ Message Queue      │    │   │
│  │  │ - Redis Sentinel   │   │ (RabbitMQ/SQS)    │    │   │
│  │  │ - AOF Persistence  │   │ - Background Jobs │    │   │
│  │  │ - Replication      │   │ - Async Processing│    │   │
│  │  └────────────────────┘   └────────────────────┘   │    │
│  │                                                       │    │
│  └───────────────────────────────────────────────────┘    │
│                                                           │
└────────────────────────────────────────────────────────────┘
```

## Key Architectural Principles

1. **Scalability**
   - Horizontal scaling of API servers
   - Redis caching layer for performance
   - Database connection pooling
   - WebSocket room-based broadcasting

2. **High Availability**
   - Load balancing
   - Database replication
   - Redis sentinel/cluster
   - Graceful degradation

3. **Security**
   - Defense in depth (multiple layers)
   - Encryption in transit + at rest
   - JWT + API Key authentication
   - Rate limiting + DDoS protection
   - RBAC + Row-level security

4. **Observability**
   - Structured logging (JSON)
   - Distributed tracing (optional Jaeger)
   - Metrics collection (Prometheus)
   - Performance monitoring (NewRelic/DataDog)

5. **Multi-Tenancy**
   - Complete data isolation per org
   - Separate API keys per org
   - Namespace-based WebSocket rooms
   - Row-level security filters

6. **Real-Time Capabilities**
   - WebSocket for live updates
   - Redis Pub/Sub for internal messaging
   - Event-driven architecture
   - Minimal latency (sub-second)
