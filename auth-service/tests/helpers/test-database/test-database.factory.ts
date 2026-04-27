import { Config } from '../../../src/config';
import { DatabaseType } from '../../../src/types/db';
import { MongoStrategy } from './strategies/mongo.strategy';
import { ITestDatabaseStrategy } from './test-database';

export class TestDatabaseFactory {
  static createStrategy(): ITestDatabaseStrategy {
    switch (Config.DB_TYPE as DatabaseType) {
      case DatabaseType.MONGO:
        return new MongoStrategy();
      default:
        throw new Error(`Unsupported database type: ${Config.DB_TYPE}`);
    }
  }
}
