import { NextFunction, Request, Response } from 'express';
import { IUserService } from '@/services/user/IUserService';
import { toUserResponse } from '@/mappers/user.mapper';
import { CreateUserDto } from '@/validators/user/create.validator';

class UserController {
  constructor(private userService: IUserService) {}

  async create(
    req: Request<object, object, CreateUserDto>,
    res: Response,
    next: NextFunction
  ) {
    try {
      const user = await this.userService.create(req.body);
      return res.status(201).json(toUserResponse(user));
    } catch (err) {
      next(err);
    }
  }

  async getAll(req: Request, res: Response, next: NextFunction) {
    const currentPage = Number(req.query.currentPage) || 1;
    const perPage = Number(req.query.perPage) || 6;
    const q = req.query.q as string | undefined;
    const role = req.query.role as string | undefined;

    try {
      const [users, total] = await this.userService.findAll({ currentPage, perPage, q, role });
      return res.status(200).json({
        currentPage,
        perPage,
        total,
        data: users.map(toUserResponse),
      });
    } catch (err) {
      next(err);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await this.userService.findById(req.params.id as string);
      return res.status(200).json(toUserResponse(user));
    } catch (err) {
      next(err);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await this.userService.update(
        req.params.id as string,
        req.body
      );
      return res.status(200).json(toUserResponse(user));
    } catch (err) {
      next(err);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await this.userService.delete(req.params.id as string);
      return res.status(200).json({ id: user.id });
    } catch (err) {
      next(err);
    }
  }
}

export default UserController;
