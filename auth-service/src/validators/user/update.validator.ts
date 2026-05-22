import { z } from 'zod';
import { UserRole } from '@/types/user';

export const UpdateUserSchema = z.object({
  firstName: z.string().trim().min(1, 'First name is required').optional(),
  lastName: z.string().trim().min(1, 'Last name is required').optional(),
  role: z.enum([UserRole.CUSTOMER, UserRole.MANAGER]).optional(),
  tenantId: z
    .string()
    .regex(/^[a-fA-F0-9]{24}$/, 'Invalid tenant id')
    .optional(),
});

export type UpdateUserDto = z.infer<typeof UpdateUserSchema>;
