import mongoose from 'mongoose';
import { Config } from '../config';
import { logger } from '../factories/logger.factory';
import { IDbConnection } from './IDbConnection';

export class MongoDbConnection implements IDbConnection {
  async connect(): Promise<void> {
    await mongoose.connect(Config.MONGO_URI as string);
    logger.info('Connected to MongoDB');
  }
}
