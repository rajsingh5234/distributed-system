import { z } from 'zod';

export const TenantQuerySchema = z.object({
  q: z.string().trim().default(''),
  currentPage: z.coerce.number().int().min(1).default(1).catch(1),
  perPage: z.coerce.number().int().min(1).default(6).catch(6),
});

export type TenantQuery = z.infer<typeof TenantQuerySchema>;
