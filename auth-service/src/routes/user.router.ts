import { Router } from 'express';
import UserController from '@/controllers/user.controller';
import validateRequest from '@/middlewares/validateRequest';
import { CreateUserSchema } from '@/validators/user/create.validator';
import { ServiceFactory } from '@/factories/service.factory';
import authenticate from '@/middlewares/authenticate';
import { authorize } from '@/middlewares/authorize';
import { UserRole } from '@/types/user';

const router = Router();

const userService = ServiceFactory.createUserService();
const userController = new UserController(userService);

router.post('/', authenticate, authorize(UserRole.ADMIN), validateRequest(CreateUserSchema), (req, res, next) => userController.create(req, res, next));

export default router;
