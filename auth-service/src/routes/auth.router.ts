import { Router } from 'express';
import AuthController from '../controllers/auth.controller';
import { ServiceFactory } from '../factories/service.factory';

const router = Router();

const authService = ServiceFactory.createAuthService();
const authController = new AuthController(authService);

router.post('/register', (req, res, next) => authController.register(req, res, next));


export default router;