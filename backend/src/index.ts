import 'dotenv/config';
import express, { Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { createServer } from 'http';
import { envConfig } from '@/config/env';
import { initDb, closeDb } from '@/database/prisma';
import { initRedis, closeRedis } from '@/config/redis';
import {
  authMiddleware,
  errorHandler,
  notFoundHandler,
} from '@/middleware/auth';
import { globalLimiter, createRedisLimiter } from '@/middleware/rateLimit';
import authRoutes from '@/routes/auth';
import deviceRoutes from '@/routes/device';
import alertRoutes from '@/routes/alert';
import {
  initWebSocket,
  setupRedisSubscriber,
  setupOfflineDeviceChecker,
} from '@/websocket/handler';

const app = express();
const httpServer = createServer(app);

// ============ INITIALIZATION ============

async function initialize() {
  try {
    console.log('🚀 Starting DATTO RMM Backend...');

    // Connect to databases
    await initDb();
    console.log('✅ Database connected');

    await initRedis();
    console.log('✅ Redis connected');

    // Initialize WebSocket
    initWebSocket(httpServer);
    console.log('✅ WebSocket initialized');

    // Setup Redis subscriber for real-time updates
    await setupRedisSubscriber();
    console.log('✅ Redis subscriber setup');

    // Setup offline device checker
    await setupOfflineDeviceChecker();
    console.log('✅ Offline device checker setup');
  } catch (error) {
    console.error('❌ Initialization failed:', error);
    process.exit(1);
  }
}

// ============ MIDDLEWARE ============

app.use(helmet());
app.use(cors({
  origin: envConfig.corsOrigins,
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Rate limiting
app.use(globalLimiter);

// Request logging (simple)
app.use((req: Request, res: Response, next) => {
  console.log(`${new Date().toISOString()} ${req.method} ${req.path}`);
  next();
});

// ============ HEALTH CHECK ============

app.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// ============ API ROUTES ============

const apiV1 = express.Router();

// Auth routes (public)
apiV1.use('/auth', authRoutes);

// Device routes
apiV1.use('/devices', deviceRoutes);

// Alert routes
apiV1.use('/alerts', alertRoutes);

app.use('/api/v1', apiV1);

// ============ ERROR HANDLING ============

app.use(notFoundHandler);
app.use(errorHandler);

// ============ SERVER STARTUP ============

async function start() {
  await initialize();

  httpServer.listen(envConfig.apiPort, envConfig.apiHost, () => {
    console.log(`
╔══════════════════════════════════════════╗
║   DATTO RMM Backend Server Started       ║
╠══════════════════════════════════════════╣
║ Environment: ${envConfig.nodeEnv.padEnd(32)}║
║ Host: ${`${envConfig.apiHost}:${envConfig.apiPort}`.padEnd(37)}║
║ API: http://${`${envConfig.apiHost}:${envConfig.apiPort}/api/v1`.padEnd(27)}║
╚══════════════════════════════════════════╝
    `);
  });
}

// ============ GRACEFUL SHUTDOWN ============

process.on('SIGTERM', async () => {
  console.log('📭 SIGTERM signal received: closing HTTP server');
  httpServer.close(async () => {
    console.log('HTTP server closed');
    await closeDb();
    await closeRedis();
    process.exit(0);
  });
});

process.on('SIGINT', async () => {
  console.log('📭 SIGINT signal received: closing HTTP server');
  httpServer.close(async () => {
    console.log('HTTP server closed');
    await closeDb();
    await closeRedis();
    process.exit(0);
  });
});

// Start the server
start().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
