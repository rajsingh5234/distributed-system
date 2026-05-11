import { NextFunction, Request, Response } from 'express';
import { CreateUserDto } from '@/validators/user/register.validator';
import { toUserResponse } from '@/mappers/user.mapper';
import { IAuthService } from '@/services/auth/IAuthService';

class AuthController {
  constructor(private authService: IAuthService) {}

  async register(req: Request<object, object, CreateUserDto>, res: Response, next: NextFunction) {
    try {
      const { firstName, lastName, email, password } = req.body;
      const { user, accessToken, refreshToken } = await this.authService.register({ firstName, lastName, email, password });

      const cookieOptions = { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'strict' as const };
      res.cookie('accessToken', accessToken, { ...cookieOptions, maxAge: 60 * 60 * 1000 }); // 1 hour
      res.cookie('refreshToken', refreshToken, { ...cookieOptions, maxAge: 7 * 24 * 60 * 60 * 1000 }); // 7 days

      res.status(201).json({
        message: 'User registered successfully',
        user: toUserResponse(user),
      });
    } catch (err) {
      next(err);
    }
  }
}

export default AuthController;
