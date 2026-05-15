import { NextFunction, Request, Response } from 'express';
import { IUserService } from '@/services/user/IUserService';
import { toUserResponse } from '@/mappers/user.mapper';
import { CreateUserDto } from '@/validators/user/create.validator';

class UserController {
  constructor(private userService: IUserService) {}

  async create(req: Request<object, object, CreateUserDto>, res: Response, next: NextFunction) {
    try {
      const user = await this.userService.create(req.body);
      return res.status(201).json(toUserResponse(user));
    } catch (err) {
      next(err);
    }
  }
}

export default UserController;
