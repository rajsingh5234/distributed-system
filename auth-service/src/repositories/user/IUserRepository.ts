import { IUser } from '@/entities/user/iuser.entity';
import { CreateUserData } from '@/types/user';
import { UpdateUserDto } from '@/validators/user/update.validator';

export interface IUserRepository {
  create(user: CreateUserData): Promise<IUser>;
  findById(id: string): Promise<IUser | null>;
  findByEmail(email: string): Promise<IUser | null>;
  findAll(): Promise<IUser[]>;
  update(id: string, data: UpdateUserDto): Promise<IUser | null>;
  delete(id: string): Promise<IUser | null>;
}
