import { NextFunction, Request, Response } from 'express';
import { CreateUserDto } from '@/validators/user/register.validator';
import { toUserResponse } from '@/mappers/user.mapper';
import { IAuthService } from '@/services/auth/IAuthService';
import { ITokenService } from '@/services/token/ITokenService';
import { LoginUserDto } from '@/validators/user/login.validator';

class AuthController {
  constructor(
    private authService: IAuthService,
    private tokenService: ITokenService,
  ) {}

  async register(req: Request<object, object, CreateUserDto>, res: Response, next: NextFunction) {
    try {
      const { firstName, lastName, email, password } = req.body;
      const user = await this.authService.register({ firstName, lastName, email, password });

      const payload = { sub: user.id, role: user.role };
      const { token: accessToken, maxAge: accessMaxAge } = this.tokenService.generateAccessToken(payload);
      const { token: refreshToken, maxAge: refreshMaxAge } = await this.tokenService.generateRefreshToken(payload);

      const cookieOptions = { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'strict' as const };
      res.cookie('accessToken', accessToken, { ...cookieOptions, maxAge: accessMaxAge });
      res.cookie('refreshToken', refreshToken, { ...cookieOptions, maxAge: refreshMaxAge });

      res.status(201).json({
        message: 'User registered successfully',
        user: toUserResponse(user),
      });
    } catch (err) {
      next(err);
    }
  }

  async login(req: Request<object, object, LoginUserDto>, res: Response, next: NextFunction) {
    try {

      const { email, password } = req.body;
      const user = await this.authService.login({email, password});

      const payload = { sub: user.id, role: user.role };
      const { token: accessToken, maxAge: accessMaxAge } = this.tokenService.generateAccessToken(payload);
      const { token: refreshToken, maxAge: refreshMaxAge } = await this.tokenService.generateRefreshToken(payload);

      const cookieOptions = { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'strict' as const };
      res.cookie('accessToken', accessToken, { ...cookieOptions, maxAge: accessMaxAge });
      res.cookie('refreshToken', refreshToken, { ...cookieOptions, maxAge: refreshMaxAge });

      return res.status(200).json({
        message: 'Login successful',
        user: toUserResponse(user),
      });
    } catch (err) {
      next(err);
    }
  }
}

export default AuthController;
