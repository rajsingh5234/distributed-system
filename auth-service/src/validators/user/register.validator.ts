import { z } from 'zod';

export const RegisterSchema = z.object({
  firstName: z.string({ error: 'First name is required' }).trim().min(1, 'First name is required'),
  lastName: z.string({ error: 'Last name is required' }).trim().min(1, 'Last name is required'),
  email: z.string({ error: 'Email is required' }).trim().min(1, 'Email is required').toLowerCase().pipe(z.email('Invalid email format')),
  password: z.string({ error: 'Password is required' }).min(8, 'Password must be at least 8 characters'),
});

export type CreateUserDto = z.infer<typeof RegisterSchema>;
