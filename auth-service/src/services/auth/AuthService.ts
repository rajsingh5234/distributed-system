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
    const existingUser = await this.userRepository.findByEmail(user.email);
    if (existingUser) {
      throw createHttpError(400, 'Email already exists');
    }

    const hashedPassword = await HashingService.hash(user.password);
    return await this.userRepository.create({ ...user, password: hashedPassword, role: UserRole.CUSTOMER });
  }
}
