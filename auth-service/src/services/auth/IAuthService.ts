import { CreateUserDto } from '../../dtos/user/request/CreateUserDto';
import { IUser } from '../../entities/user/iuser.entity';

export interface IAuthService {
  register(user: CreateUserDto): Promise<IUser>;
}
