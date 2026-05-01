import { CreateUserDto } from '../../dtos/user/request/CreateUserDto';
import { IUser } from '../../entities/user/iuser.entity';
import UserModel from '../../entities/user/user.entity';
import { IUserRepository } from './IUserRepository';

export class UserRepository implements IUserRepository {
  async create(user: CreateUserDto): Promise<IUser> {
    return await UserModel.create(user);
  }

  async findById(id: string): Promise<IUser | null> {
    return await UserModel.findById(id);
  }

  async findByEmail(email: string): Promise<IUser | null> {
    return await UserModel.findOne({ email });
  }

}
