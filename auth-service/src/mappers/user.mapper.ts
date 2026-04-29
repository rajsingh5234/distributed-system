import { UserResponseDto } from '../dtos/user/response/UserResponseDto';
import { IUser } from '../entities/user/iuser.entity';

export const toUserResponse = (user: IUser): UserResponseDto => ({
  id: user.id,
  firstName: user.firstName,
  lastName: user.lastName,
  email: user.email,
  role: user.role,
});
