import { NextFunction, Request, Response } from 'express';
import { CreateUserDto } from '@/validators/user/register.validator';
import { toUserResponse } from '@/mappers/user.mapper';
import { IAuthService } from '@/services/auth/IAuthService';
import { ITokenService } from '@/services/token/ITokenService';
import { LoginUserDto } from '@/validators/user/login.validator';
import { RefreshTokenPayload } from '@/types/token';

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

  async self(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await this.authService.self(req.auth!.sub);
      return res.status(200).json({ user: toUserResponse(user) });
    } catch(err) {
      next(err);
    }
  }

  async refresh(req: Request, res: Response, next: NextFunction) {
    try {
      const { sub, jwtid } = req.auth as RefreshTokenPayload;

      const user = await this.authService.self(sub);
      const payload = { sub: user.id, role: user.role };

      const { token: accessToken, maxAge: accessMaxAge } = this.tokenService.generateAccessToken(payload);
      const { token: refreshToken, maxAge: refreshMaxAge } = await this.tokenService.rotateRefreshToken(jwtid, payload);

      const cookieOptions = { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'strict' as const };
      res.cookie('accessToken', accessToken, { ...cookieOptions, maxAge: accessMaxAge });
      res.cookie('refreshToken', refreshToken, { ...cookieOptions, maxAge: refreshMaxAge });

      return res.status(200).json({ message: 'Token refreshed successfully' });
    } catch (err) {
      next(err);
    }
  }

  async logout(req: Request, res: Response, next: NextFunction) {
    try {
      const { jwtid } = req.auth as RefreshTokenPayload;
      await this.tokenService.revokeRefreshToken(jwtid);

      const cookieOptions = { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'strict' as const };
      res.clearCookie('accessToken', cookieOptions);
      res.clearCookie('refreshToken', cookieOptions);

      return res.status(200).json({ message: 'Logout successful' });
    } catch (err) {
      next(err);
    }
  }
}

export default AuthController;
