import mongoose, { Document } from 'mongoose';
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
declare const _default: mongoose.Model<IDevice, {}, {}, {}, mongoose.Document<unknown, {}, IDevice, {}, mongoose.DefaultSchemaOptions> & IDevice & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}, any, IDevice>;
export default _default;
//# sourceMappingURL=Device.d.ts.map