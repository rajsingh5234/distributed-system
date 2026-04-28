import { UserRole } from '../../types/user';

export interface IUser {
  firstName: string;
  lastName: string;
  role: UserRole;
  email: string;
  password: string;
}
  