export enum UserRole {
  CUSTOMER = 'customer',
  ADMIN = 'admin',
  MANAGER = 'manager',
}

export interface CreateUserData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: UserRole;
  tenant?: string;
}
