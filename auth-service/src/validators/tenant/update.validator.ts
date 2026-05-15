import { z } from 'zod';

export const UpdateTenantSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').optional(),
  address: z.string().trim().min(1, 'Address is required').optional(),
});

export type UpdateTenantDto = z.infer<typeof UpdateTenantSchema>;
