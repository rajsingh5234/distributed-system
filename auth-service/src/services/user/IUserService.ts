import { IUser } from '@/entities/user/iuser.entity';
import { CreateUserDto } from '@/validators/user/create.validator';

export interface IUserService {
  create(data: CreateUserDto): Promise<IUser>;
  findAll(): Promise<IUser[]>;
  findById(id: string): Promise<IUser>;
}
