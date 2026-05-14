import { NextFunction, Request, Response } from 'express';
import { HttpError } from 'http-errors';

import { logger } from '@/factories/logger.factory';

const errorHandler = (
  err: HttpError & { status?: number },
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  const statusCode = err.statusCode || err.status || 500;

  logger.error(err.message);

  res.status(statusCode).json({
    errors: [
      {
        type: err.name,
        msg: err.message,
        path: '',
        location: '',
      },
    ],
  });
};

export default errorHandler;
