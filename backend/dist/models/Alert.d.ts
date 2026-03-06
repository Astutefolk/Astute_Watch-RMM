import mongoose, { Document } from 'mongoose';
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
declare const _default: mongoose.Model<IAlert, {}, {}, {}, mongoose.Document<unknown, {}, IAlert, {}, mongoose.DefaultSchemaOptions> & IAlert & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}, any, IAlert>;
export default _default;
//# sourceMappingURL=Alert.d.ts.map