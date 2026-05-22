import { Router } from 'express';
import TenantController from '@/controllers/tenant.controller';
import validateRequest from '@/middlewares/validateRequest';
import validateParams from '@/middlewares/validateParams';
import { CreateTenantSchema } from '@/validators/tenant/create.validator';
import { UpdateTenantSchema } from '@/validators/tenant/update.validator';
import { TenantParamsSchema } from '@/validators/tenant/params.validator';
import { ServiceFactory } from '@/factories/service.factory';
import authenticate from '@/middlewares/authenticate';
import { authorize } from '@/middlewares/authorize';
import { UserRole } from '@/types/user';

const router = Router();

const tenantService = ServiceFactory.createTenantService();
const tenantController = new TenantController(tenantService);

router.post(
  '/',
  authenticate,
  authorize(UserRole.ADMIN),
  validateRequest(CreateTenantSchema),
  (req, res, next) => tenantController.create(req, res, next)
);
router.get('/', (req, res, next) => tenantController.getAll(req, res, next));
router.get(
  '/:id',
  authenticate,
  authorize(UserRole.ADMIN),
  validateParams(TenantParamsSchema),
  (req, res, next) => tenantController.getById(req, res, next)
);
router.patch(
  '/:id',
  authenticate,
  authorize(UserRole.ADMIN),
  validateParams(TenantParamsSchema),
  validateRequest(UpdateTenantSchema),
  (req, res, next) => tenantController.update(req, res, next)
);
router.delete(
  '/:id',
  authenticate,
  authorize(UserRole.ADMIN),
  validateParams(TenantParamsSchema),
  (req, res, next) => tenantController.delete(req, res, next)
);

export default router;
