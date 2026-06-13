import { IUser } from '@/entities/user/iuser.entity';
import { CreateUserDto } from '@/validators/user/create.validator';
import { UpdateUserDto } from '@/validators/user/update.validator';
import { UserQueryParams } from '@/types/user';

export interface IUserService {
  create(data: CreateUserDto): Promise<IUser>;
  findAll(params: UserQueryParams): Promise<[IUser[], number]>;
  findById(id: string): Promise<IUser>;
  update(id: string, data: UpdateUserDto): Promise<IUser>;
  delete(id: string): Promise<IUser>;
}
