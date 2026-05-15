import { Router } from 'express';
import TenantController from '@/controllers/tenant.controller';
import validateRequest from '@/middlewares/validateRequest';
import { CreateTenantSchema } from '@/validators/tenant/create.validator';
import { ServiceFactory } from '@/factories/service.factory';

const router = Router();

const tenantService = ServiceFactory.createTenantService();
const tenantController = new TenantController(tenantService);

router.post('/', validateRequest(CreateTenantSchema), (req, res, next) => tenantController.create(req, res, next));

export default router;
