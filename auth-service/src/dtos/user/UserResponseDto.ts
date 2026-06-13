import { UserRole } from '@/types/user';
import { ITenant } from '@/entities/tenant/itenant.entity';

export interface UserResponseDto {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
  tenant?: ITenant | null;
}
