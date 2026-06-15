import { NextFunction, Request, Response } from 'express';
import { HttpError } from 'http-errors';
import { randomUUID } from 'crypto';
import { logger } from '@/factories/logger.factory';

const errorHandler = (
  err: HttpError,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction
) => {
  const errorId = randomUUID();
  const statusCode = err.status || 500;
  const isProduction = process.env.NODE_ENV === 'production';

  const message = statusCode === 400 ? err.message : 'Internal server error';

  logger.error(err.message, {
    id: errorId,
    statusCode,
    error: err.stack,
    path: req.path,
    method: req.method,
  });

  res.status(statusCode).json({
    errors: [
      {
        ref: errorId,
        type: err.name,
        msg: message,
        path: req.path,
        method: req.method,
        location: 'server',
        stack: isProduction ? null : err.stack,
      },
    ],
  });
};

export default errorHandler;
