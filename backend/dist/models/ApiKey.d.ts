import mongoose, { Document } from 'mongoose';
export interface IApiKey extends Document {
    key: string;
    name: string;
    isActive: boolean;
    organizationId: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}
declare const _default: mongoose.Model<IApiKey, {}, {}, {}, mongoose.Document<unknown, {}, IApiKey, {}, mongoose.DefaultSchemaOptions> & IApiKey & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}, any, IApiKey>;
export default _default;
//# sourceMappingURL=ApiKey.d.ts.map