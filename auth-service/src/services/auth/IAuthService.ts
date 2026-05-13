import { IUser } from '@/entities/user/iuser.entity';
import { LoginUserDto } from '@/validators/user/login.validator';
import { CreateUserDto } from '@/validators/user/register.validator';

export interface IAuthService {
  register(user: CreateUserDto): Promise<IUser>;
  login(credentials: LoginUserDto): Promise<IUser>;
}
