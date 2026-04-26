import mongoose from 'mongoose';
import { Config } from '../config';
import logger from '../config/logger';
import { IDbConnection } from './IDbConnection';

export class MongoDbConnection implements IDbConnection {
  async connect(): Promise<void> {
    await mongoose.connect(Config.MONGO_URI as string);
    logger.info('Connected to MongoDB');
  }
}
