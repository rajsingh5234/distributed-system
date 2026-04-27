import { IAuthService } from '../services/auth/IAuthService';
import { AuthService } from '../services/auth/AuthService';
import { RepositoryFactory } from './repository.factory';

export class ServiceFactory {
  static createAuthService(): IAuthService {
    return new AuthService(RepositoryFactory.createUserRepository());
  }
}
