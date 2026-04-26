import { NextFunction, Request, Response } from 'express';
import { CreateUserDto } from '../dtos/CreateUserDto';
import { AuthService } from '../services/AuthService';

class AuthController {
  constructor(private authService: AuthService) {}

  async register(req: Request<object, object, CreateUserDto>, res: Response, next: NextFunction) {
    try {
      const { firstName, lastName, email, password } = req.body;
      const user = await this.authService.register({ firstName, lastName, email, password });
      res.status(201).json({
        message: 'User registered successfully',
        user
      });
    } catch (err) {
      next(err);
    }
  }
}

export default AuthController;
