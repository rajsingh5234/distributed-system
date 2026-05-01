import { IUser } from '@/entities/user/iuser.entity';
import { CreateUserData } from '@/types/user';

export interface IUserRepository {
  create(user: CreateUserData): Promise<IUser>;
  findById(id: string): Promise<IUser | null>;
  findByEmail(email: string): Promise<IUser | null>;
}
