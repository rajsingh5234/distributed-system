import { Router } from 'express';
import TenantController from '@/controllers/tenant.controller';
import validateRequest from '@/middlewares/validateRequest';
import { CreateTenantSchema } from '@/validators/tenant/create.validator';
import { ServiceFactory } from '@/factories/service.factory';
import authenticate from '@/middlewares/authenticate';
import { authorize } from '@/middlewares/authorize';
import { UserRole } from '@/types/user';

const router = Router();

const tenantService = ServiceFactory.createTenantService();
const tenantController = new TenantController(tenantService);

router.post('/', authenticate, authorize(UserRole.ADMIN), validateRequest(CreateTenantSchema), (req, res, next) => tenantController.create(req, res, next));
router.get('/', authenticate, authorize(UserRole.ADMIN), (req, res, next) => tenantController.getAll(req, res, next));

export default router;
