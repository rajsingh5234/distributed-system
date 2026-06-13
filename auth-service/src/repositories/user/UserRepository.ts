import { IUser } from '@/entities/user/iuser.entity';
import { CreateUserData, UserQueryParams } from '@/types/user';
import { UpdateUserDto } from '@/validators/user/update.validator';
import UserModel from '@/entities/user/user.entity';
import { IUserRepository } from './IUserRepository';

export class UserRepository implements IUserRepository {
  async create(user: CreateUserData): Promise<IUser> {
    return await UserModel.create(user);
  }

  async findById(id: string): Promise<IUser | null> {
    return await UserModel.findById(id).populate('tenant');
  }

  async findByEmail(email: string): Promise<IUser | null> {
    return await UserModel.findOne({ email });
  }

  async findAll({ currentPage, perPage, q, role }: UserQueryParams): Promise<[IUser[], number]> {
    const query: Record<string, unknown> = {};

    if (q) {
      query.$or = [
        { firstName: { $regex: q, $options: 'i' } },
        { lastName: { $regex: q, $options: 'i' } },
        { email: { $regex: q, $options: 'i' } },
      ];
    }

    if (role) {
      query.role = role;
    }

    const skip = (currentPage - 1) * perPage;

    const [data, total] = await Promise.all([
      UserModel.find(query).populate('tenant').skip(skip).limit(perPage).sort({ createdAt: -1 }),
      UserModel.countDocuments(query),
    ]);

    return [data, total];
  }

  async update(id: string, data: UpdateUserDto): Promise<IUser | null> {
    return await UserModel.findByIdAndUpdate(id, data, {
      returnDocument: 'after',
    });
  }

  async delete(id: string): Promise<IUser | null> {
    return await UserModel.findByIdAndDelete(id);
  }
}
