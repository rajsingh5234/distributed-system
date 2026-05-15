import { Router } from 'express';
import authRouter from './auth.router';
import tenantRouter from './tenant.router';
import userRouter from './user.router';

const router = Router();

router.use('/auth', authRouter);
router.use('/tenants', tenantRouter);
router.use('/users', userRouter);

export default router;
