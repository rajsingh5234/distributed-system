import createHttpError from 'http-errors';
import { CreateUserDto } from '../../dtos/user/request/CreateUserDto';
import { IUser } from '../../entities/user/iuser.entity';
import { IUserRepository } from '../../repositories/user/IUserRepository';
import { UserRole } from '../../types/user';
import { HashingService } from '../../utils/hashing';
import { IAuthService } from './IAuthService';

export class AuthService implements IAuthService {
  constructor(private userRepository: IUserRepository) {}

  async register(user: CreateUserDto): Promise<IUser> {
    try {
      const hashedPassword = await HashingService.hash(user.password);
      return await this.userRepository.create({ ...user, password: hashedPassword, role: UserRole.CUSTOMER });
    } catch {
      throw createHttpError(500, 'Failed to register user');
    }
  }
}
