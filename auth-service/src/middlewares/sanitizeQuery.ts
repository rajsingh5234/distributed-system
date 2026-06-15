import { NextFunction, Request, Response } from 'express';
import { ZodType } from 'zod';

const sanitizeQuery =
  (schema: ZodType) => (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.query);
    res.locals.validatedQuery = result.success ? result.data : {};
    next();
  };

export default sanitizeQuery;
