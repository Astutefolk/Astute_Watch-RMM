# Testing Setup & Quick Start

Complete guide to running tests for DATTO RMM platform.

## Installation

### Backend Testing Setup

```bash
cd backend

# Install test dependencies
npm install

# Verify installation
npm run test -- --version
```

### Frontend Testing Setup

```bash
cd frontend

# Install test dependencies
npm install

# Verify installation
npm run test -- --version
```

## Running Tests

### Backend Unit Tests

```bash
cd backend

# Run all tests
npm test

# Run tests in watch mode (re-run on file changes)
npm run test:watch

# Run tests with coverage report
npm run test:coverage

# Run specific test file
npm test -- helpers.test.ts

# Run tests matching pattern
npm test -- --testNamePattern="Button"
```

### Frontend Unit Tests

```bash
cd frontend

# Run all tests
npm test

# Run in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage

# Run specific component tests
npm test UI.test.tsx

# Update snapshots (if using snapshots)
npm test -- -u
```

## Writing Tests

### Backend Test Template

Create a file like `src/services/example.test.ts`:

```typescript
import { ExampleService } from './example';

describe('ExampleService', () => {
  let service: ExampleService;

  // Setup before each test
  beforeEach(() => {
    service = new ExampleService();
  });

  // Cleanup after each test
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('method name', () => {
    it('should do something when condition is met', async () => {
      // Arrange
      const input = 'test input';

      // Act
      const result = await service.method(input);

      // Assert
      expect(result).toBe('expected output');
    });

    it('should throw error on invalid input', async () => {
      // Assert
      await expect(service.method(null)).rejects.toThrow('Invalid input');
    });
  });
});
```

### Frontend Test Template

Create a file like `src/components/Example.test.tsx`:

```typescript
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Example } from './Example';

describe('Example Component', () => {
  it('should render component', () => {
    render(<Example />);
    expect(screen.getByText('Expected text')).toBeInTheDocument();
  });

  it('should handle user interaction', async () => {
    render(<Example />);
    const button = screen.getByRole('button');
    
    await userEvent.click(button);
    
    expect(screen.getByText('After click')).toBeInTheDocument();
  });
});
```

## Testing Best Practices

### 1. Test Organization
- **Arrange**: Set up test data
- **Act**: Execute the function/component
- **Assert**: Verify the results

### 2. Naming Conventions
- Test files: `feature.test.ts` or `feature.spec.ts`
- Test suites: `describe('FeatureName', () => {})`
- Test cases: `it('should do X when Y happens', () => {})`

### 3. Coverage Goals
- **Target**: 80% code coverage
- **Lines**: All business logic covered
- **Branches**: Happy path + error cases
- **Functions**: All exported functions tested

### 4. Mocking
```typescript
// Mock external dependencies
jest.mock('axios', () => ({
  get: jest.fn(),
  post: jest.fn()
}));

// Mock functions
const mockFunction = jest.fn();
mockFunction.mockReturnValue('value');
mockFunction.mockResolvedValue(Promise.resolve('value'));
mockFunction.mockRejectedValue(new Error('error'));

// Verify mock calls
expect(mockFunction).toHaveBeenCalled();
expect(mockFunction).toHaveBeenCalledWith('arg');
expect(mockFunction).toHaveBeenCalledTimes(3);
```

## Test Examples

### Backend Service Test

```typescript
// src/services/device.test.ts
import { DeviceService } from './device';
import { db } from '../database/prisma';

describe('DeviceService', () => {
  let deviceService: DeviceService;

  beforeEach(() => {
    deviceService = new DeviceService();
  });

  describe('registerDevice', () => {
    it('should register a new device', async () => {
      const result = await deviceService.registerDevice({
        deviceId: 'PC-001',
        organizationId: 'org-1',
        osVersion: 'Windows 11'
      });

      expect(result).toHaveProperty('id');
      expect(result.deviceId).toBe('PC-001');
      expect(result.isOnline).toBe(true);
    });

    it('should update existing device registration', async () => {
      // First registration
      const first = await deviceService.registerDevice({
        deviceId: 'PC-001',
        organizationId: 'org-1',
        osVersion: 'Windows 11'
      });

      // Second registration same device
      const second = await deviceService.registerDevice({
        deviceId: 'PC-001',
        organizationId: 'org-1',
        osVersion: 'Windows 11 Pro'
      });

      expect(first.id).toBe(second.id); // Same device
      expect(second.osVersion).toBe('Windows 11 Pro'); // Updated
    });
  });

  describe('recordHeartbeat', () => {
    it('should record device metrics', async () => {
      const device = await deviceService.registerDevice({
        deviceId: 'PC-001',
        organizationId: 'org-1',
        osVersion: 'Windows 11'
      });

      const heartbeat = await deviceService.recordHeartbeat({
        deviceId: device.id,
        cpu: 45.5,
        ram: 62.3,
        disk: 78.1
      });

      expect(heartbeat).toHaveProperty('id');
      expect(heartbeat.cpu).toBe(45.5);
      expect(heartbeat.ram).toBe(62.3);
      expect(heartbeat.disk).toBe(78.1);
    });
  });
});
```

### Frontend Component Test

```typescript
// src/components/DeviceCard.test.tsx
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

  it('should display device information', () => {
    render(<DeviceCard device={mockDevice} />);

    expect(screen.getByText('Workstation 1')).toBeInTheDocument();
    expect(screen.getByText('PC-001')).toBeInTheDocument();
    expect(screen.getByText(/Windows 11/)).toBeInTheDocument();
  });

  it('should show online status with green badge', () => {
    render(<DeviceCard device={mockDevice} />);

    const badge = screen.getByText('Online');
    expect(badge).toHaveClass('bg-green-100');
  });

  it('should show offline status with red badge', () => {
    const offlineDevice = { ...mockDevice, isOnline: false };
    render(<DeviceCard device={offlineDevice} />);

    const badge = screen.getByText('Offline');
    expect(badge).toHaveClass('bg-red-100');
  });
});
```

## Debugging Tests

### Print Debug Info
```typescript
import { screen, render } from '@testing-library/react';

it('should render', () => {
  const { debug } = render(<Component />);
  debug(); // Print full DOM tree
  screen.debug(); // Print specific element
});
```

### Common Issues

**Tests not running:**
```bash
# Clear cache
npm test -- --clearCache

# Rebuild TypeScript
npm run build
```

**Module not found:**
```bash
# Reinstall node_modules
rm -rf node_modules
npm install

# Rebuild Prisma
npm run prisma:generate
```

**Async test timeout:**
```typescript
// Increase timeout for slow tests
it('should do something slow', async () => {
  // test code
}, 10000); // 10 second timeout
```

## CI/CD Integration

### GitHub Actions Example

Create `.github/workflows/test.yml`:

```yaml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Backend Tests
        working-directory: ./backend
        run: |
          npm ci
          npm run test:coverage
      
      - name: Frontend Tests
        working-directory: ./frontend
        run: |
          npm ci
          npm run test:coverage
      
      - name: Upload Coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./backend/coverage/lcov.info,./frontend/coverage/lcov.info
```

## Performance Tips

### Speed Up Tests

```bash
# Run tests in parallel (default)
npm test

# Run single threaded (slower but better for debugging)
npm test -- --runInBand

# Run specific test suite only
npm test -- service/auth

# Skip slow tests during development
npm test -- --testPathIgnorePatterns="integration|e2e"
```

### Optimize Coverage

```bash
# Generate HTML coverage report
npm run test:coverage

# Open coverage report
open coverage/lcov-report/index.html

# Check coverage thresholds
npm test -- --collectCoverageFrom="src/**/*.ts" --coverage
```

## Resources

- [Jest Documentation](https://jestjs.io/)
- [React Testing Library](https://testing-library.com/react)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)
- [Supertest Documentation](https://github.com/visionmedia/supertest)

## Next Steps

1. Run existing tests: `npm test`
2. Write tests for new features before implementation
3. Aim for 80%+ coverage on business logic
4. Add integration tests for critical paths
5. Set up CI/CD to run tests on every commit
