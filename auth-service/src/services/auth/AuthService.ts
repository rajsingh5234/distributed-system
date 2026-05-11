import createHttpError from 'http-errors';
import { CreateUserDto } from '@/validators/user/register.validator';
import { IUserRepository } from '@/repositories/user/IUserRepository';
import { CreateUserData, UserRole } from '@/types/user';
import { HashingService } from '@/utils/hashing';
import { TokenService } from '@/utils/token';
import { IAuthService, RegisterResult } from './IAuthService';

export class AuthService implements IAuthService {
  constructor(private userRepository: IUserRepository) {}

  async register(user: CreateUserDto): Promise<RegisterResult> {
    const existingUser = await this.userRepository.findByEmail(user.email);
    if (existingUser) {
      throw createHttpError(400, 'Email already exists');
    }

    const hashedPassword = await HashingService.hash(user.password);
    const userData: CreateUserData = { ...user, password: hashedPassword, role: UserRole.CUSTOMER };
    const createdUser = await this.userRepository.create(userData);

    const payload = { sub: createdUser.id, role: createdUser.role };
    const accessToken = TokenService.generateAccessToken(payload);
    const refreshToken = TokenService.generateRefreshToken(payload);

    return { user: createdUser, accessToken, refreshToken };
  }
}
