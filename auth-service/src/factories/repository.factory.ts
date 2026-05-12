import { Config } from '@/config';
import { DatabaseType } from '@/types/db';
import { IUserRepository } from '@/repositories/user/IUserRepository';
import { UserRepository } from '@/repositories/user/UserRepository';
import { IRefreshTokenRepository } from '@/repositories/refresh-token/IRefreshTokenRepository';
import { RefreshTokenRepository } from '@/repositories/refresh-token/RefreshTokenRepository';

export class RepositoryFactory {
  static createUserRepository(): IUserRepository {
    switch (Config.DB_TYPE as DatabaseType) {
      case DatabaseType.MONGO:
        return new UserRepository();
      default:
        throw new Error(`Unsupported database type: ${Config.DB_TYPE}`);
    }
  }

  static createRefreshTokenRepository(): IRefreshTokenRepository {
    switch (Config.DB_TYPE as DatabaseType) {
      case DatabaseType.MONGO:
        return new RefreshTokenRepository();
      default:
        throw new Error(`Unsupported database type: ${Config.DB_TYPE}`);
    }
  }
}
