import { IUser } from '../../entities/user/iuser.entity';
import { CreateUserDto } from '../../validators/user/register.validator';

export interface IAuthService {
  register(user: CreateUserDto): Promise<IUser>;
}
