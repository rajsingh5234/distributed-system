import { z } from 'zod';

export const UserQuerySchema = z.object({
  q: z.string().trim().default(''),
  role: z.string().default(''),
  currentPage: z.coerce.number().int().min(1).default(1).catch(1),
  perPage: z.coerce.number().int().min(1).default(6).catch(6),
});

export type UserQuery = z.infer<typeof UserQuerySchema>;
