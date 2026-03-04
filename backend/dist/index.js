"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const http_1 = require("http");
const env_1 = require("@/config/env");
const prisma_1 = require("@/database/prisma");
const redis_1 = require("@/config/redis");
const auth_1 = require("@/middleware/auth");
const rateLimit_1 = require("@/middleware/rateLimit");
const auth_2 = __importDefault(require("@/routes/auth"));
const device_1 = __importDefault(require("@/routes/device"));
const alert_1 = __importDefault(require("@/routes/alert"));
const handler_1 = require("@/websocket/handler");
const app = (0, express_1.default)();
const httpServer = (0, http_1.createServer)(app);
// ============ INITIALIZATION ============
async function initialize() {
    try {
        console.log('🚀 Starting DATTO RMM Backend...');
        // Connect to databases
        await (0, prisma_1.initDb)();
        console.log('✅ Database connected');
        await (0, redis_1.initRedis)();
        console.log('✅ Redis connected');
        // Initialize WebSocket
        (0, handler_1.initWebSocket)(httpServer);
        console.log('✅ WebSocket initialized');
        // Setup Redis subscriber for real-time updates
        await (0, handler_1.setupRedisSubscriber)();
        console.log('✅ Redis subscriber setup');
        // Setup offline device checker
        await (0, handler_1.setupOfflineDeviceChecker)();
        console.log('✅ Offline device checker setup');
    }
    catch (error) {
        console.error('❌ Initialization failed:', error);
        process.exit(1);
    }
}
// ============ MIDDLEWARE ============
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)({
    origin: env_1.envConfig.corsOrigins,
    credentials: true,
}));
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ limit: '10mb', extended: true }));
// Rate limiting
app.use(rateLimit_1.globalLimiter);
// Request logging (simple)
app.use((req, _res, next) => {
    console.log(`${new Date().toISOString()} ${req.method} ${req.path}`);
    next();
});
// ============ HEALTH CHECK ============
app.get('/health', (_req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
    });
});
// ============ API ROUTES ============
const apiV1 = express_1.default.Router();
// Auth routes (public)
apiV1.use('/auth', auth_2.default);
// Device routes
apiV1.use('/devices', device_1.default);
// Alert routes
apiV1.use('/alerts', alert_1.default);
app.use('/api/v1', apiV1);
// ============ ERROR HANDLING ============
app.use(auth_1.notFoundHandler);
app.use(auth_1.errorHandler);
// ============ SERVER STARTUP ============
async function start() {
    await initialize();
    httpServer.listen(env_1.envConfig.apiPort, env_1.envConfig.apiHost, () => {
        console.log(`
╔══════════════════════════════════════════╗
║   DATTO RMM Backend Server Started       ║
╠══════════════════════════════════════════╣
║ Environment: ${env_1.envConfig.nodeEnv.padEnd(32)}║
║ Host: ${`${env_1.envConfig.apiHost}:${env_1.envConfig.apiPort}`.padEnd(37)}║
║ API: http://${`${env_1.envConfig.apiHost}:${env_1.envConfig.apiPort}/api/v1`.padEnd(27)}║
╚══════════════════════════════════════════╝
    `);
    });
}
// ============ GRACEFUL SHUTDOWN ============
process.on('SIGTERM', async () => {
    console.log('📭 SIGTERM signal received: closing HTTP server');
    httpServer.close(async () => {
        console.log('HTTP server closed');
        await (0, prisma_1.closeDb)();
        await (0, redis_1.closeRedis)();
        process.exit(0);
    });
});
process.on('SIGINT', async () => {
    console.log('📭 SIGINT signal received: closing HTTP server');
    httpServer.close(async () => {
        console.log('HTTP server closed');
        await (0, prisma_1.closeDb)();
        await (0, redis_1.closeRedis)();
        process.exit(0);
    });
});
// Start the server
start().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
});
//# sourceMappingURL=index.js.map