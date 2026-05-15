import { z } from 'zod';

export const CreateTenantSchema = z.object({
  name: z.string({ error: 'Name is required' }).trim().min(1, 'Name is required'),
  address: z.string({ error: 'Address is required' }).trim().min(1, 'Address is required'),
});

export type CreateTenantDto = z.infer<typeof CreateTenantSchema>;
