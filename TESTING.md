# DATTO RMM - Testing Guide

Complete testing strategy for frontend, backend, and integration testing.

## Quick Start Testing

### Run All Tests
```bash
# Backend unit tests
cd backend && npm test

# Frontend unit tests
cd frontend && npm test

# Integration tests
npm run test:integration

# E2E tests (requires running services)
npm run test:e2e
```

---

## Backend Testing

### Setup

```bash
cd backend
npm install --save-dev jest @types/jest ts-jest supertest @types/supertest
```

### Unit Tests

Test files: `src/**/*.test.ts`

**Example: `src/services/auth.test.ts`**
```typescript
import { AuthService } from './auth';
import { db } from '../database/prisma';

describe('AuthService', () => {
  let authService: AuthService;

  beforeEach(() => {
    authService = new AuthService();
  });

  describe('register', () => {
    it('should create a new user with hashed password', async () => {
      const result = await authService.register({
        email: 'test@example.com',
        password: 'SecurePass123!',
        organizationName: 'Test Org'
      });

      expect(result).toHaveProperty('user');
      expect(result).toHaveProperty('apiKey');
      expect(result.user.email).toBe('test@example.com');
    });

    it('should reject duplicate email', async () => {
      await authService.register({
        email: 'duplicate@example.com',
        password: 'Pass123!',
        organizationName: 'Org 1'
      });

      await expect(
        authService.register({
          email: 'duplicate@example.com',
          password: 'Pass456!',
          organizationName: 'Org 2'
        })
      ).rejects.toThrow('Email already registered');
    });
  });

  describe('login', () => {
    it('should return tokens on successful login', async () => {
      await authService.register({
        email: 'user@example.com',
        password: 'Password123!',
        organizationName: 'Test Org'
      });

      const result = await authService.login('user@example.com', 'Password123!');
      
      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
      expect(result.user.email).toBe('user@example.com');
    });

    it('should reject invalid password', async () => {
      await authService.register({
        email: 'user@example.com',
        password: 'CorrectPass123!',
        organizationName: 'Test Org'
      });

      await expect(
        authService.login('user@example.com', 'WrongPassword')
      ).rejects.toThrow('Invalid credentials');
    });
  });
});
```

### API Integration Tests

Test files: `src/**/*.integration.test.ts`

**Example: `src/routes/auth.integration.test.ts`**
```typescript
import request from 'supertest';
import { app } from '../index';
import { db } from '../database/prisma';

describe('Auth API Routes', () => {
  beforeEach(async () => {
    // Clear test database
    await db.user.deleteMany({});
    await db.organization.deleteMany({});
  });

  describe('POST /api/v1/auth/register', () => {
    it('should register a new user', async () => {
      const response = await request(app)
        .post('/api/v1/auth/register')
        .send({
          email: 'newuser@example.com',
          password: 'SecurePass123!',
          organizationName: 'My Organization'
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('user');
      expect(response.body).toHaveProperty('apiKey');
      expect(response.body.user.email).toBe('newuser@example.com');
    });

    it('should return 400 for invalid email', async () => {
      const response = await request(app)
        .post('/api/v1/auth/register')
        .send({
          email: 'invalid-email',
          password: 'SecurePass123!',
          organizationName: 'My Org'
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });

    it('should return 400 for weak password', async () => {
      const response = await request(app)
        .post('/api/v1/auth/register')
        .send({
          email: 'user@example.com',
          password: 'weak',
          organizationName: 'My Org'
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('password');
    });
  });

  describe('POST /api/v1/auth/login', () => {
    beforeEach(async () => {
      await request(app)
        .post('/api/v1/auth/register')
        .send({
          email: 'testuser@example.com',
          password: 'TestPass123!',
          organizationName: 'Test Org'
        });
    });

    it('should return tokens on successful login', async () => {
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'testuser@example.com',
          password: 'TestPass123!'
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('accessToken');
      expect(response.body).toHaveProperty('refreshToken');
    });

    it('should return 401 for invalid credentials', async () => {
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'testuser@example.com',
          password: 'WrongPassword'
        });

      expect(response.status).toBe(401);
    });
  });

  describe('GET /api/v1/auth/me', () => {
    it('should return current user with valid token', async () => {
      const registerRes = await request(app)
        .post('/api/v1/auth/register')
        .send({
          email: 'authuser@example.com',
          password: 'TestPass123!',
          organizationName: 'Test Org'
        });

      const loginRes = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'authuser@example.com',
          password: 'TestPass123!'
        });

      const response = await request(app)
        .get('/api/v1/auth/me')
        .set('Authorization', `Bearer ${loginRes.body.accessToken}`);

      expect(response.status).toBe(200);
      expect(response.body.email).toBe('authuser@example.com');
    });

    it('should return 401 without token', async () => {
      const response = await request(app)
        .get('/api/v1/auth/me');

      expect(response.status).toBe(401);
    });
  });
});
```

### Setup Jest Configuration

**`backend/jest.config.js`**
```javascript
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testMatch: ['**/*.test.ts'],
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/index.ts'
  ],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1'
  }
};
```

**`backend/package.json` - Add scripts**
```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage"
  }
}
```

---

## Frontend Testing

### Setup

```bash
cd frontend
npm install --save-dev jest @testing-library/react @testing-library/jest-dom @testing-library/user-event @types/jest ts-jest
```

### Unit Tests

Test files: `src/**/*.test.tsx`

**Example: `src/store/auth.test.ts`**
```typescript
import { useAuthStore } from './auth';

describe('Auth Store', () => {
  beforeEach(() => {
    // Reset store state
    useAuthStore.setState({
      user: null,
      accessToken: null,
      refreshToken: null
    });
    localStorage.clear();
  });

  it('should set user and tokens', () => {
    const store = useAuthStore.getState();
    
    store.setUser({
      id: '1',
      email: 'test@example.com',
      role: 'ADMIN',
      organizationId: 'org-1'
    });
    
    store.setTokens('access-token', 'refresh-token');

    const state = useAuthStore.getState();
    expect(state.user?.email).toBe('test@example.com');
    expect(state.accessToken).toBe('access-token');
  });

  it('should clear auth on logout', () => {
    const store = useAuthStore.getState();
    
    store.setUser({
      id: '1',
      email: 'test@example.com',
      role: 'ADMIN',
      organizationId: 'org-1'
    });
    
    store.clearAuth();

    const state = useAuthStore.getState();
    expect(state.user).toBeNull();
    expect(state.accessToken).toBeNull();
  });

  it('should persist to localStorage', () => {
    const store = useAuthStore.getState();
    
    store.setUser({
      id: '1',
      email: 'test@example.com',
      role: 'ADMIN',
      organizationId: 'org-1'
    });
    
    store.setTokens('token', 'refresh');
    store.saveToStorage();

    expect(localStorage.getItem('auth')).toBeDefined();
    expect(localStorage.getItem('accessToken')).toBe('token');
  });
});
```

**Example: `src/components/UI.test.tsx`**
```typescript
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button, Card, Badge } from './UI';

describe('UI Components', () => {
  describe('Button', () => {
    it('should render button with text', () => {
      render(<Button>Click me</Button>);
      expect(screen.getByText('Click me')).toBeInTheDocument();
    });

    it('should call onClick handler', async () => {
      const onClick = jest.fn();
      render(<Button onClick={onClick}>Click</Button>);
      
      await userEvent.click(screen.getByText('Click'));
      expect(onClick).toHaveBeenCalledTimes(1);
    });

    it('should apply variant styles', () => {
      const { container } = render(<Button variant="danger">Delete</Button>);
      expect(container.querySelector('button')).toHaveClass('bg-red-600');
    });

    it('should be disabled when disabled prop is true', () => {
      render(<Button disabled>Disabled</Button>);
      expect(screen.getByText('Disabled')).toBeDisabled();
    });
  });

  describe('Card', () => {
    it('should render card with children', () => {
      render(<Card>Card content</Card>);
      expect(screen.getByText('Card content')).toBeInTheDocument();
    });

    it('should apply header and footer', () => {
      render(
        <Card header="Title" footer="Footer">
          Content
        </Card>
      );
      expect(screen.getByText('Title')).toBeInTheDocument();
      expect(screen.getByText('Footer')).toBeInTheDocument();
    });
  });

  describe('Badge', () => {
    it('should render badge with label', () => {
      render(<Badge label="Online" />);
      expect(screen.getByText('Online')).toBeInTheDocument();
    });

    it('should apply variant styles', () => {
      const { container } = render(<Badge label="Critical" variant="danger" />);
      expect(container.querySelector('span')).toHaveClass('bg-red-100');
    });
  });
});
```

### Component Tests

**Example: `src/components/Device.test.tsx`**
```typescript
import { render, screen } from '@testing-library/react';
import { DeviceCard } from './Device';

describe('DeviceCard', () => {
  const mockDevice = {
    id: 'device-1',
    deviceId: 'PC-001',
    name: 'Workstation 1',
    osVersion: 'Windows 11 Pro',
    lastSeen: new Date(),
    isOnline: true,
    organizationId: 'org-1',
    createdAt: new Date(),
    updatedAt: new Date()
  };

  it('should display device name', () => {
    render(<DeviceCard device={mockDevice} />);
    expect(screen.getByText('Workstation 1')).toBeInTheDocument();
  });

  it('should show online status', () => {
    render(<DeviceCard device={mockDevice} />);
    expect(screen.getByText('Online')).toBeInTheDocument();
  });

  it('should show offline status', () => {
    const offlineDevice = { ...mockDevice, isOnline: false };
    render(<DeviceCard device={offlineDevice} />);
    expect(screen.getByText('Offline')).toBeInTheDocument();
  });

  it('should display OS version', () => {
    render(<DeviceCard device={mockDevice} />);
    expect(screen.getByText(/Windows 11/)).toBeInTheDocument();
  });
});
```

### Setup Jest Configuration

**`frontend/jest.config.js`**
```javascript
const nextJest = require('next/jest')

const createJestConfig = nextJest({
  dir: './',
})

const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jest-environment-jsdom',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  testMatch: ['**/__tests__/**/*.ts?(x)', '**/?(*.)+(spec|test).ts?(x)'],
}

module.exports = createJestConfig(customJestConfig)
```

**`frontend/jest.setup.js`**
```javascript
import '@testing-library/jest-dom'
```

**`frontend/package.json` - Add scripts**
```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage"
  }
}
```

---

## Integration Testing

Test complete workflows with real services.

**`integration.test.ts`**
```typescript
import axios from 'axios';
import { io } from 'socket.io-client';

const API_URL = 'http://localhost:3000/api/v1';
const WS_URL = 'http://localhost:3000';

describe('Integration Tests', () => {
  let accessToken: string;
  let apiKey: string;
  let deviceId: string;

  describe('Complete User Flow', () => {
    it('should register, login, and create device', async () => {
      // 1. Register
      const registerRes = await axios.post(`${API_URL}/auth/register`, {
        email: 'integration@test.com',
        password: 'IntegrationTest123!',
        organizationName: 'Integration Test Org'
      });

      expect(registerRes.status).toBe(201);
      expect(registerRes.data).toHaveProperty('apiKey');
      apiKey = registerRes.data.apiKey;

      // 2. Login
      const loginRes = await axios.post(`${API_URL}/auth/login`, {
        email: 'integration@test.com',
        password: 'IntegrationTest123!'
      });

      expect(loginRes.status).toBe(200);
      accessToken = loginRes.data.accessToken;

      // 3. Get dashboard (verify authenticated)
      const dashboardRes = await axios.get(`${API_URL}/devices/dashboard`, {
        headers: { Authorization: `Bearer ${accessToken}` }
      });

      expect(dashboardRes.status).toBe(200);
      expect(dashboardRes.data).toHaveProperty('stats');
    });

    it('should send heartbeat with API key', async () => {
      const heartbeatRes = await axios.post(
        `${API_URL}/devices/heartbeat`,
        {
          deviceId: 'test-device-001',
          cpu: 45.2,
          ram: 62.5,
          disk: 78.1,
          osVersion: 'Windows 11'
        },
        {
          headers: { 'X-API-Key': apiKey }
        }
      );

      expect(heartbeatRes.status).toBe(200);
      expect(heartbeatRes.data).toHaveProperty('id');
      deviceId = heartbeatRes.data.id;
    });

    it('should receive real-time updates via WebSocket', async () => {
      const socket = io(WS_URL, {
        auth: { token: accessToken },
        reconnection: true
      });

      return new Promise((resolve, reject) => {
        socket.on('connect', () => {
          // Subscribe to device updates
          socket.emit('subscribe:device', { deviceId });

          // Send heartbeat
          axios.post(
            `${API_URL}/devices/heartbeat`,
            {
              deviceId,
              cpu: 50,
              ram: 65,
              disk: 80,
              osVersion: 'Windows 11'
            },
            { headers: { 'X-API-Key': apiKey } }
          );
        });

        socket.on('device:metrics', (data) => {
          expect(data).toHaveProperty('cpu');
          expect(data.cpu).toBe(50);
          socket.disconnect();
          resolve(data);
        });

        setTimeout(() => {
          socket.disconnect();
          reject(new Error('WebSocket timeout'));
        }, 5000);
      });
    });
  });

  describe('Alert System', () => {
    it('should trigger alert when threshold exceeded', async () => {
      // Send high CPU heartbeat
      await axios.post(
        `${API_URL}/devices/heartbeat`,
        {
          deviceId: 'test-device-high-cpu',
          cpu: 95.5, // Should trigger alert
          ram: 30,
          disk: 50,
          osVersion: 'Windows 11'
        },
        { headers: { 'X-API-Key': apiKey } }
      );

      // Wait for alert processing
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Get alerts
      const alertsRes = await axios.get(`${API_URL}/alerts`, {
        headers: { Authorization: `Bearer ${accessToken}` }
      });

      expect(alertsRes.status).toBe(200);
      const criticalAlerts = alertsRes.data.data.filter(
        (a: any) => a.severity === 'CRITICAL'
      );
      expect(criticalAlerts.length).toBeGreaterThan(0);
    });
  });
});
```

---

## E2E Testing (Optional - Playwright)

### Setup

```bash
npm install --save-dev @playwright/test
npx playwright install
```

**`e2e/auth.spec.ts`**
```typescript
import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3001');
  });

  test('should register new account', async ({ page }) => {
    // Click register link
    await page.click('a:has-text("Register")');
    
    // Fill form
    await page.fill('input[name="email"]', 'e2e@test.com');
    await page.fill('input[name="password"]', 'E2ETest123!');
    await page.fill('input[name="organizationName"]', 'E2E Org');
    
    // Submit
    await page.click('button:has-text("Register")');
    
    // Verify API key display
    await expect(page.locator('text=API Key')).toBeVisible();
  });

  test('should login and view dashboard', async ({ page }) => {
    // Click login
    await page.click('a:has-text("Login")');
    
    // Fill form
    await page.fill('input[name="email"]', 'e2e@test.com');
    await page.fill('input[name="password"]', 'E2ETest123!');
    
    // Submit
    await page.click('button:has-text("Login")');
    
    // Verify dashboard
    await expect(page.locator('text=Dashboard')).toBeVisible();
    await expect(page.locator('text=Total Devices')).toBeVisible();
  });

  test('should display device list', async ({ page }) => {
    await page.goto('http://localhost:3001/devices');
    
    // Verify devices page loads
    await expect(page.locator('text=Devices')).toBeVisible();
  });
});
```

---

## Testing Checklist

### Unit Testing
- [ ] All service classes have 80%+ coverage
- [ ] All utility functions tested
- [ ] Edge cases covered
- [ ] Error handling verified

### Integration Testing
- [ ] User registration and login flow
- [ ] Device heartbeat and metrics
- [ ] Alert creation and resolution
- [ ] WebSocket real-time updates
- [ ] Multi-tenant isolation

### Performance Testing
- [ ] Dashboard loads in <2 seconds
- [ ] API responses <500ms
- [ ] WebSocket reconnection works
- [ ] Handle 100+ concurrent devices

### Security Testing
- [ ] JWT expiration and refresh
- [ ] API key validation
- [ ] Rate limiting active
- [ ] SQL injection prevention
- [ ] XSS protection active

### Manual Testing Scenarios
- [ ] Agent registration and heartbeat
- [ ] Metrics visualization updates
- [ ] Alert notifications trigger
- [ ] Multi-device dashboard performance
- [ ] Mobile responsive layout
- [ ] Dark mode (if enabled)

---

## Running Tests

```bash
# Backend unit tests
cd backend
npm test

# Backend coverage
npm run test:coverage

# Frontend unit tests
cd frontend
npm test

# Frontend watch mode
npm run test:watch

# Integration tests (requires running services)
npm run test:integration

# E2E tests (requires running services)
npm run test:e2e
```

---

## CI/CD Integration

**`.github/workflows/test.yml`** (GitHub Actions)
```yaml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    
    services:
      postgres:
        image: postgres:16
        env:
          POSTGRES_DB: datto_test
          POSTGRES_PASSWORD: password
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
      
      redis:
        image: redis:7
        options: >-
          --health-cmd "redis-cli ping"
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

    steps:
      - uses: actions/checkout@v3
      
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Backend tests
        working-directory: ./backend
        run: |
          npm install
          npm run test -- --coverage
      
      - name: Frontend tests
        working-directory: ./frontend
        run: |
          npm install
          npm run test -- --coverage
      
      - name: Upload coverage
        uses: codecov/codecov-action@v3
```

