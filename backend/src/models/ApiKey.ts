import mongoose, { Schema, Document } from 'mongoose';

export interface IApiKey extends Document {
  key: string;
  name: string;
  isActive: boolean;
  organizationId: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const apiKeySchema = new Schema<IApiKey>(
  {
    key: {
      type: String,
      required: true,
      unique: true,
    },
    name: {
      type: String,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    organizationId: {
      type: Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model<IApiKey>('ApiKey', apiKeySchema);
