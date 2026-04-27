import mongoose from 'mongoose';
import { Config } from '../config';
import { LoggerFactory } from '../factories/logger.factory';

const logger = LoggerFactory.createLogger();
import { IDbConnection } from './IDbConnection';

export class MongoDbConnection implements IDbConnection {
  async connect(): Promise<void> {
    await mongoose.connect(Config.MONGO_URI as string);
    logger.info('Connected to MongoDB');
  }
}
