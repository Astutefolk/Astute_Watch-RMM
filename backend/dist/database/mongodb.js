"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectDB = connectDB;
exports.disconnectDB = disconnectDB;
exports.getConnection = getConnection;
const mongoose_1 = __importDefault(require("mongoose"));
const env_1 = require("@/config/env");
let isConnected = false;
async function connectDB() {
    if (isConnected) {
        console.log('📦 Database already connected');
        return mongoose_1.default.connection;
    }
    try {
        await mongoose_1.default.connect(env_1.envConfig.mongodbUri);
        isConnected = true;
        console.log('✅ MongoDB connected');
        return mongoose_1.default.connection;
    }
    catch (error) {
        console.error('❌ MongoDB connection failed:', error);
        throw error;
    }
}
async function disconnectDB() {
    if (!isConnected)
        return;
    try {
        await mongoose_1.default.disconnect();
        isConnected = false;
        console.log('✅ MongoDB disconnected');
    }
    catch (error) {
        console.error('❌ MongoDB disconnection failed:', error);
        throw error;
    }
}
function getConnection() {
    return mongoose_1.default.connection;
}
//# sourceMappingURL=mongodb.js.map