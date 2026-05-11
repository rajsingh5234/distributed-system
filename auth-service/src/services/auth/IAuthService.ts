import { IUser } from '@/entities/user/iuser.entity';
import { CreateUserDto } from '@/validators/user/register.validator';

export interface RegisterResult {
  user: IUser;
  accessToken: string;
  refreshToken: string;
}

export interface IAuthService {
  register(user: CreateUserDto): Promise<RegisterResult>;
}
