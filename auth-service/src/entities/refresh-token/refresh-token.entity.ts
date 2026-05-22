import mongoose from 'mongoose';
import { IRefreshToken } from './irefresh-token.entity';

const refreshTokenSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true },
    expiresAt: { type: Date, required: true },
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
  }
);

export default mongoose.model<IRefreshToken>(
  'RefreshToken',
  refreshTokenSchema
);
