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

export interface UserQueryParams {
  currentPage: number;
  perPage: number;
  q?: string;
  role?: string;
}
