import { UserRole } from '@/types/user';
import { ITenant } from '../tenant/itenant.entity';

export interface IUser {
  id: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  email: string;
  password: string;
  tenant?: ITenant | string;
}
