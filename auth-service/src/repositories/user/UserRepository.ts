import { CreateUserDto } from '../../dtos/CreateUserDto';
import { IUser } from '../../entities/user/iuser.entity';
import UserModel from '../../entities/user/user.entity';
import { UserRole } from '../../types/user';
import { IUserRepository } from './IUserRepository';

export class UserRepository implements IUserRepository {
  async create(user: CreateUserDto): Promise<IUser> {
    return await UserModel.create({
      ...user,
      role: UserRole.CUSTOMER,
    });
  }

  async findById(id: string): Promise<IUser | null> {
    return await UserModel.findById(id);
  }

}
