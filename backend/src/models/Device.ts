import mongoose, { Schema, Document } from 'mongoose';

export interface IDevice extends Document {
  name: string;
  status: 'ONLINE' | 'OFFLINE' | 'ERROR';
  organizationId: mongoose.Types.ObjectId;
  hostname?: string;
  osType?: string;
  cpuUsage?: number;
  memoryUsage?: number;
  lastSeen: Date;
  createdAt: Date;
  updatedAt: Date;
}

const deviceSchema = new Schema<IDevice>(
  {
    name: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ['ONLINE', 'OFFLINE', 'ERROR'],
      default: 'OFFLINE',
    },
    organizationId: {
      type: Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
    },
    hostname: String,
    osType: String,
    cpuUsage: Number,
    memoryUsage: Number,
    lastSeen: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

export default mongoose.model<IDevice>('Device', deviceSchema);
