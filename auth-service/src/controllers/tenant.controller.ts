import { NextFunction, Request, Response } from 'express';
import { ITenantService } from '@/services/tenant/ITenantService';
import { CreateTenantDto } from '@/validators/tenant/create.validator';

class TenantController {
  constructor(private tenantService: ITenantService) {}

  async create(req: Request<object, object, CreateTenantDto>, res: Response, next: NextFunction) {
    try {
      const { name, address } = req.body;
      const tenant = await this.tenantService.create({ name, address });
      return res.status(201).json(tenant);
    } catch (err) {
      next(err);
    }
  }

}

export default TenantController;
