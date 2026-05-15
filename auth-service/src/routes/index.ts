import { Router } from 'express';
import authRouter from './auth.router';
import tenantRouter from './tenant.router';

const router = Router();

router.use('/auth', authRouter);
router.use('/tenants', tenantRouter);

export default router;
