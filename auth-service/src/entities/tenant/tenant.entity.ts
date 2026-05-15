import mongoose from 'mongoose';
import { ITenant } from './itenant.entity';

const tenantSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    address: { type: String, required: true },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_doc, ret: Record<string, unknown>) => {
        ret.id = (ret._id as { toString(): string }).toString();
        delete ret._id;
        delete ret.__v;
      },
    },
  },
);

export default mongoose.model<ITenant>('Tenant', tenantSchema);
