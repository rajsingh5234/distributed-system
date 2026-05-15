import { UserRole } from '@/types/user';

export interface IUser {
  id: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  email: string;
  password: string;
  tenant?: string;
}
