import { z } from 'zod';
import { NextFunction, Request, Response } from 'express';

const schema = z.object({
  q: z.string().trim().default(''),
  role: z.string().default(''),
  currentPage: z.coerce.number().int().min(1).default(1).catch(1),
  perPage: z.coerce.number().int().min(1).default(6).catch(6),
});

export type UserQuery = z.infer<typeof schema>;

export const UserQuerySchema = (req: Request, res: Response, next: NextFunction) => {
  res.locals.validatedQuery = schema.parse(req.query);
  next();
};
