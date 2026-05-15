import { z } from 'zod';

export const UserParamsSchema = z.object({
  id: z.string().regex(/^[a-fA-F0-9]{24}$/, 'Invalid user id'),
});
