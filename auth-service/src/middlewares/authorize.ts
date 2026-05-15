import { NextFunction, Request, Response } from 'express';
import createHttpError from 'http-errors';
import { UserRole } from '@/types/user';

export const authorize = (...roles: UserRole[]) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    const userRole = req.auth?.role as UserRole;
    if (!userRole || !roles.includes(userRole)) {
      return next(createHttpError(403, 'Forbidden'));
    }
    next();
  };
};
