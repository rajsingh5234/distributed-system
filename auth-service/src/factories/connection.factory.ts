import { Config } from '../config';
import { IDbConnection } from '../database/IDbConnection';
import { MongoDbConnection } from '../database/MongoDbConnection';
import { DatabaseType } from '../types/db';

export class ConnectionFactory {
  static createConnection(): IDbConnection {
    switch (Config.DB_TYPE as DatabaseType) {
      case DatabaseType.MONGO:
        return new MongoDbConnection();
      default:
        throw new Error(`Unsupported database type: ${Config.DB_TYPE}`);
    }
  }
}
