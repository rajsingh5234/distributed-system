import mongoose from 'mongoose';
import { Config } from '@/config';
import { ITestDatabaseStrategy } from '../test-database';

export class MongoStrategy implements ITestDatabaseStrategy {
  async connect() {
    await mongoose.connect(Config.MONGO_URI as string);
  }

  async disconnect() {
    await mongoose.disconnect();
  }

  async cleanup() {
    const collections = mongoose.connection.collections;
    for (const key in collections) {
      await collections[key].deleteMany({});
    }
  }
}
