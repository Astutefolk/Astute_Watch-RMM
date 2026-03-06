import mongoose, { Schema, Document } from 'mongoose';

export interface IAlert extends Document {
  title: string;
  message: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  status: 'UNRESOLVED' | 'RESOLVED';
  deviceId?: mongoose.Types.ObjectId;
  organizationId: mongoose.Types.ObjectId;
  resolvedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const alertSchema = new Schema<IAlert>(
  {
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    severity: {
      type: String,
      enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
      default: 'MEDIUM',
    },
    status: {
      type: String,
      enum: ['UNRESOLVED', 'RESOLVED'],
      default: 'UNRESOLVED',
    },
    deviceId: {
      type: Schema.Types.ObjectId,
      ref: 'Device',
    },
    organizationId: {
      type: Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
    },
    resolvedAt: Date,
  },
  { timestamps: true }
);

export default mongoose.model<IAlert>('Alert', alertSchema);
