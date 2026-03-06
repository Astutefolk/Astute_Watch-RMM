import mongoose from 'mongoose';
import { envConfig } from '@/config/env';

let isConnected = false;

export async function connectDB() {
  if (isConnected) {
    console.log('📦 Database already connected');
    return mongoose.connection;
  }

  try {
    await mongoose.connect(envConfig.mongodbUri);
    isConnected = true;
    console.log('✅ MongoDB connected');
    return mongoose.connection;
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error);
    throw error;
  }
}

export async function disconnectDB() {
  if (!isConnected) return;
  
  try {
    await mongoose.disconnect();
    isConnected = false;
    console.log('✅ MongoDB disconnected');
  } catch (error) {
    console.error('❌ MongoDB disconnection failed:', error);
    throw error;
  }
}

export function getConnection() {
  return mongoose.connection;
}
