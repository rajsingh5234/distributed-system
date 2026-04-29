import { NextFunction, Request, Response } from 'express';
import { CreateUserDto } from '../dtos/user/request/CreateUserDto';
import { toUserResponse } from '../mappers/user.mapper';
import { IAuthService } from '../services/auth/IAuthService';

class AuthController {
  constructor(private authService: IAuthService) {}

  async register(req: Request<object, object, CreateUserDto>, res: Response, next: NextFunction) {
    try {
      const { firstName, lastName, email, password } = req.body;
      const user = await this.authService.register({ firstName, lastName, email, password });
      res.status(201).json({
        message: 'User registered successfully',
        user: toUserResponse(user)
      });
    } catch (err) {
      next(err);
    }
  }
}

export default AuthController;
