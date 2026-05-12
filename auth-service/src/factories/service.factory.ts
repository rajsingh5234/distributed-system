import { IAuthService } from '@/services/auth/IAuthService';
import { AuthService } from '@/services/auth/AuthService';
import { ITokenService } from '@/services/token/ITokenService';
import { TokenService } from '@/services/token/TokenService';
import { RepositoryFactory } from './repository.factory';

export class ServiceFactory {
  static createAuthService(): IAuthService {
    return new AuthService(RepositoryFactory.createUserRepository());
  }

  static createTokenService(): ITokenService {
    return new TokenService(RepositoryFactory.createRefreshTokenRepository());
  }
}
