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

  async getAll(_req: Request, res: Response, next: NextFunction) {
    try {
      const tenants = await this.tenantService.findAll();
      return res.status(200).json(tenants);
    } catch (err) {
      next(err);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const tenant = await this.tenantService.findById(req.params.id as string);
      return res.status(200).json(tenant);
    } catch (err) {
      next(err);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const tenant = await this.tenantService.update(req.params.id as string, req.body);
      return res.status(200).json(tenant);
    } catch (err) {
      next(err);
    }
  }

}

export default TenantController;
