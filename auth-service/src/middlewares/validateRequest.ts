import { NextFunction, Request, Response } from 'express';
import { ZodType } from 'zod';

export const validateRequest = (schema: ZodType) => (req: Request, res: Response, next: NextFunction) => {
  const result = schema.safeParse(req.body);
  if (!result.success) {
    res.status(400).json({
      errors: result.error.issues.map((issue) => ({
        type: 'validation_error',
        msg: issue.message,
        path: issue.path.join('.'),
        location: 'body',
      })),
    });
    return;
  }
  req.body = result.data;
  next();
};
