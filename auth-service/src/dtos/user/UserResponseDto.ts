import { UserRole } from '@/types/user';

export interface UserResponseDto {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
}
