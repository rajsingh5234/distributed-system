import { IAuthService } from '@/services/auth/IAuthService';
import { AuthService } from '@/services/auth/AuthService';
import { ITokenService } from '@/services/token/ITokenService';
import { TokenService } from '@/services/token/TokenService';
import { ITenantService } from '@/services/tenant/ITenantService';
import { TenantService } from '@/services/tenant/TenantService';
import { IUserService } from '@/services/user/IUserService';
import { UserService } from '@/services/user/UserService';
import { RepositoryFactory } from './repository.factory';

export class ServiceFactory {
  static createAuthService(): IAuthService {
    return new AuthService(RepositoryFactory.createUserRepository());
  }

  static createTokenService(): ITokenService {
    return new TokenService(RepositoryFactory.createRefreshTokenRepository());
  }

  static createTenantService(): ITenantService {
    return new TenantService(RepositoryFactory.createTenantRepository());
  }

  static createUserService(): IUserService {
    return new UserService(
      RepositoryFactory.createUserRepository(),
      RepositoryFactory.createRefreshTokenRepository()
    );
  }
}
