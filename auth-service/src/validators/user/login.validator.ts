import { z } from 'zod';

export const LoginSchema = z.object({
  email: z.string({ error: 'Email is required' }).trim().min(1, 'Email is required').toLowerCase().pipe(z.email('Invalid email format')),
  password: z.string({ error: 'Password is required' }).min(8, 'Password must be at least 8 characters'),
});

export type LoginUserDto = z.infer<typeof LoginSchema>;
