import { Router } from 'express';
import AuthController from '../controllers/auth.controller';
import { AuthService } from '../services/AuthService';
import { RepositoryFactory } from '../factories/repository.factory';

const router = Router();

const userRepository = RepositoryFactory.createUserRepository();
const authService = new AuthService(userRepository);
const authController = new AuthController(authService);

router.post('/register', (req, res, next) => authController.register(req, res, next));


export default router;