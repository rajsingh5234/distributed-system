import { CreateUserDto } from '../../dtos/CreateUserDto';
import { IUser } from '../../entities/user/iuser.entity';

export interface IAuthService {
  register(user: CreateUserDto): Promise<IUser>;
}
