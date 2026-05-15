import { Router } from 'express';
import UserController from '@/controllers/user.controller';
import validateRequest from '@/middlewares/validateRequest';
import validateParams from '@/middlewares/validateParams';
import { CreateUserSchema } from '@/validators/user/create.validator';
import { UserParamsSchema } from '@/validators/user/params.validator';
import { ServiceFactory } from '@/factories/service.factory';
import authenticate from '@/middlewares/authenticate';
import { authorize } from '@/middlewares/authorize';
import { UserRole } from '@/types/user';

const router = Router();

const userService = ServiceFactory.createUserService();
const userController = new UserController(userService);

router.post('/', authenticate, authorize(UserRole.ADMIN), validateRequest(CreateUserSchema), (req, res, next) => userController.create(req, res, next));
router.get('/', authenticate, authorize(UserRole.ADMIN), (req, res, next) => userController.getAll(req, res, next));
router.get('/:id', authenticate, authorize(UserRole.ADMIN), validateParams(UserParamsSchema), (req, res, next) => userController.getById(req, res, next));

export default router;
