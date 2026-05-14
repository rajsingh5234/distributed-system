import { Router } from 'express';
import AuthController from '@/controllers/auth.controller';
import validateRequest from '@/middlewares/validateRequest';
import { ServiceFactory } from '@/factories/service.factory';
import { RegisterSchema } from '@/validators/user/register.validator';
import { LoginSchema } from '@/validators/user/login.validator';
import authenticate from '@/middlewares/authenticate';
import validateRefreshToken from '@/middlewares/validateRefreshToken';

const router = Router();

const authService = ServiceFactory.createAuthService();
const tokenService = ServiceFactory.createTokenService();
const authController = new AuthController(authService, tokenService);

router.post('/register', validateRequest(RegisterSchema), (req, res, next) => authController.register(req, res, next));
router.post('/login', validateRequest(LoginSchema), (req, res, next) => authController.login(req, res, next));
router.get('/self', authenticate, (req, res, next) => authController.self(req, res, next));
router.post('/refresh', validateRefreshToken, (req, res, next) => authController.refresh(req, res, next));

export default router;
