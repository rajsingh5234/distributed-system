import createHttpError from 'http-errors';
import { IUser } from '@/entities/user/iuser.entity';
import { IUserRepository } from '@/repositories/user/IUserRepository';
import { HashingService } from '@/utils/hashing';
import { CreateUserDto } from '@/validators/user/create.validator';
import { IUserService } from './IUserService';

export class UserService implements IUserService {
  constructor(private userRepository: IUserRepository) {}

  async create(data: CreateUserDto): Promise<IUser> {
    const existingUser = await this.userRepository.findByEmail(data.email);
    if (existingUser) throw createHttpError(400, 'Email already exists');

    const hashedPassword = await HashingService.hash(data.password);
    return await this.userRepository.create({ ...data, password: hashedPassword });
  }
}
