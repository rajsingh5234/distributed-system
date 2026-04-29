import { CreateUserDto } from '../../dtos/user/request/CreateUserDto';
import { IUser } from '../../entities/user/iuser.entity';

export interface IUserRepository {
  create(user: CreateUserDto): Promise<IUser>;
  findById(id: string): Promise<IUser | null>;
}
