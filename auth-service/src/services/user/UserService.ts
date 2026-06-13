import createHttpError from 'http-errors';
import { IUser } from '@/entities/user/iuser.entity';
import { IUserRepository } from '@/repositories/user/IUserRepository';
import { IRefreshTokenRepository } from '@/repositories/refresh-token/IRefreshTokenRepository';
import { HashingService } from '@/utils/hashing';
import { CreateUserDto } from '@/validators/user/create.validator';
import { UpdateUserDto } from '@/validators/user/update.validator';
import { IUserService } from './IUserService';
import { UserQueryParams } from '@/types/user';

export class UserService implements IUserService {
  constructor(
    private userRepository: IUserRepository,
    private refreshTokenRepository: IRefreshTokenRepository
  ) {}

  async create(data: CreateUserDto): Promise<IUser> {
    const existingUser = await this.userRepository.findByEmail(data.email);
    if (existingUser) throw createHttpError(400, 'Email already exists');

    const hashedPassword = await HashingService.hash(data.password);
    return await this.userRepository.create({
      ...data,
      password: hashedPassword,
    });
  }

  async findAll(params: UserQueryParams): Promise<[IUser[], number]> {
    return await this.userRepository.findAll(params);
  }

  async findById(id: string): Promise<IUser> {
    const user = await this.userRepository.findById(id);
    if (!user) throw createHttpError(404, 'User not found');
    return user;
  }

  async update(id: string, data: UpdateUserDto): Promise<IUser> {
    const user = await this.userRepository.update(id, data);
    if (!user) throw createHttpError(404, 'User not found');
    return user;
  }

  async delete(id: string): Promise<IUser> {
    const user = await this.userRepository.delete(id);
    if (!user) throw createHttpError(404, 'User not found');
    await this.refreshTokenRepository.deleteByUserId(id);
    return user;
  }
}
