import { Config } from '../config';
import { IUserRepository } from '../repositories/user/IUserRepository';
import { UserRepository } from '../repositories/user/UserRepository';

export enum DatabaseType {
  MONGO = 'mongo',
  POSTGRES = 'postgres',
}

export class RepositoryFactory {
  static createUserRepository(): IUserRepository {
    switch (Config.DB_TYPE as DatabaseType) {
      case DatabaseType.MONGO:
        return new UserRepository();
      case DatabaseType.POSTGRES:
        throw new Error('Postgres repository not implemented yet');
      default:
        throw new Error(`Unsupported database type: ${Config.DB_TYPE}`);
    }
  }
}
