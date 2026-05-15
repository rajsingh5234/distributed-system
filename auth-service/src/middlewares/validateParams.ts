import { NextFunction, Request, Response } from 'express';
import { ZodType } from 'zod';

const validateParams = (schema: ZodType) => (req: Request, res: Response, next: NextFunction) => {
  const result = schema.safeParse(req.params);
  if (!result.success) {
    res.status(400).json({
      errors: result.error.issues.map((issue) => ({
        type: 'validation_error',
        msg: issue.message,
        path: issue.path.join('.'),
        location: 'params',
      })),
    });
    return;
  }
  req.params = result.data as Record<string, string>;
  next();
};

export default validateParams;
