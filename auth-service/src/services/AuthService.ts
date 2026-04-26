import { CreateUserDto } from '../dtos/CreateUserDto';
import { IUser } from '../entities/user/iuser.entity';
import { IUserRepository } from '../repositories/user/IUserRepository';

export class AuthService {
  constructor(private userRepository: IUserRepository) {}

  async register(user: CreateUserDto): Promise<IUser> {
    return await this.userRepository.create(user);
  }
}
