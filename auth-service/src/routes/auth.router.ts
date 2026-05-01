import { Router } from 'express';
import AuthController from '../controllers/auth.controller';
import { validateRequest } from '../middlewares/validateRequest';
import { ServiceFactory } from '../factories/service.factory';
import { RegisterSchema } from '../validators/user/register.validator';

const router = Router();

const authService = ServiceFactory.createAuthService();
const authController = new AuthController(authService);

router.post('/register', validateRequest(RegisterSchema), (req, res, next) => authController.register(req, res, next));


export default router;