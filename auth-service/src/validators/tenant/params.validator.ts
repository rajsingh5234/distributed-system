import { z } from 'zod';

export const TenantParamsSchema = z.object({
  id: z.string().regex(/^[a-fA-F0-9]{24}$/, 'Invalid tenant id'),
});
