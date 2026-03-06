import mongoose, { Document } from 'mongoose';
export interface IOrganization extends Document {
    name: string;
    createdAt: Date;
    updatedAt: Date;
}
declare const _default: mongoose.Model<IOrganization, {}, {}, {}, mongoose.Document<unknown, {}, IOrganization, {}, mongoose.DefaultSchemaOptions> & IOrganization & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}, any, IOrganization>;
export default _default;
//# sourceMappingURL=Organization.d.ts.map