import { IUser } from '@/entities/user/iuser.entity';
import { CreateUserData } from '@/types/user';
import { UpdateUserDto } from '@/validators/user/update.validator';
import UserModel from '@/entities/user/user.entity';
import { IUserRepository } from './IUserRepository';

export class UserRepository implements IUserRepository {
  async create(user: CreateUserData): Promise<IUser> {
    return await UserModel.create(user);
  }

  async findById(id: string): Promise<IUser | null> {
    return await UserModel.findById(id);
  }

  async findByEmail(email: string): Promise<IUser | null> {
    return await UserModel.findOne({ email });
  }

  async findAll(): Promise<IUser[]> {
    return await UserModel.find();
  }

  async update(id: string, data: UpdateUserDto): Promise<IUser | null> {
    return await UserModel.findByIdAndUpdate(id, data, { returnDocument: 'after' });
  }

  async delete(id: string): Promise<IUser | null> {
    return await UserModel.findByIdAndDelete(id);
  }
}
