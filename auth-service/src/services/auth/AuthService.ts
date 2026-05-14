import createHttpError from 'http-errors';
import { CreateUserDto } from '@/validators/user/register.validator';
import { IUser } from '@/entities/user/iuser.entity';
import { IUserRepository } from '@/repositories/user/IUserRepository';
import { CreateUserData, UserRole } from '@/types/user';
import { HashingService } from '@/utils/hashing';
import { IAuthService } from './IAuthService';
import { LoginUserDto } from '@/validators/user/login.validator';

export class AuthService implements IAuthService {
  constructor(private userRepository: IUserRepository) {}
  
  async register(user: CreateUserDto): Promise<IUser> {
    const existingUser = await this.userRepository.findByEmail(user.email);
    if (existingUser) {
      throw createHttpError(400, 'Email already exists');
    }

    const hashedPassword = await HashingService.hash(user.password);
    const userData: CreateUserData = { ...user, password: hashedPassword, role: UserRole.CUSTOMER };
    return await this.userRepository.create(userData);
  }

  async login(credentials: LoginUserDto): Promise<IUser> {
      const { email, password } = credentials;
      const user = await this.userRepository.findByEmail(email);
      if (!user) {
        throw createHttpError(401, 'Invalid email or password');
      }

      const isPasswordValid = await HashingService.compare(password, user.password);
      if (!isPasswordValid) {
        throw createHttpError(401, 'Invalid email or password');
      }

      return user;
  }

  async self(userId: string): Promise<IUser> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw createHttpError(404, 'User not found');
    }
    return user;
  }
}
