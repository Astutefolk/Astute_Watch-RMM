"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
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
const mongodb_1 = require("@/database/mongodb");
const redis_1 = require("@/config/redis");
const auth_1 = require("@/middleware/auth");
const rateLimit_1 = require("@/middleware/rateLimit");
const app = (0, express_1.default)();
const httpServer = (0, http_1.createServer)(app);
// ============ INITIALIZATION ============
async function initialize() {
    try {
        console.log('🚀 Starting DATTO RMM Backend...');
        // Connect to MongoDB
        await (0, mongodb_1.connectDB)();
        console.log('✅ MongoDB connected');
        await (0, redis_1.initRedis)();
        console.log('✅ Redis connected');
        // Import websocket handler AFTER databases are initialized
        const { initWebSocket, setupRedisSubscriber, setupOfflineDeviceChecker, } = await Promise.resolve().then(() => __importStar(require('@/websocket/handler')));
        // Initialize WebSocket
        initWebSocket(httpServer);
        console.log('✅ WebSocket initialized');
        // Setup Redis subscriber for real-time updates
        await setupRedisSubscriber();
        console.log('✅ Redis subscriber setup');
        // Setup offline device checker
        await setupOfflineDeviceChecker();
        console.log('✅ Offline device checker setup');
        // Register routes AFTER all services are initialized
        const authRoutes = (await Promise.resolve().then(() => __importStar(require('@/routes/auth')))).default;
        const deviceRoutes = (await Promise.resolve().then(() => __importStar(require('@/routes/device')))).default;
        const alertRoutes = (await Promise.resolve().then(() => __importStar(require('@/routes/alert')))).default;
        const apiV1 = express_1.default.Router();
        apiV1.use('/auth', authRoutes);
        apiV1.use('/devices', deviceRoutes);
        apiV1.use('/alerts', alertRoutes);
        app.use('/api/v1', apiV1);
        console.log('✅ Routes registered');
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
        await (0, mongodb_1.disconnectDB)();
        await (0, redis_1.closeRedis)();
        process.exit(0);
    });
});
process.on('SIGINT', async () => {
    console.log('📭 SIGINT signal received: closing HTTP server');
    httpServer.close(async () => {
        console.log('HTTP server closed');
        await (0, mongodb_1.disconnectDB)();
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