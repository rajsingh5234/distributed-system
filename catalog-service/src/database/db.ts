import mongoose from 'mongoose';
import { Config } from '@/config';
import { logger } from '@/factories/logger.factory';

export const connectDB = async () => {
  await mongoose.connect(Config.MONGO_URI as string);
  logger.info('Connected to MongoDB');
};
