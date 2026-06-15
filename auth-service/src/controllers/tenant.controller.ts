import { NextFunction, Request, Response } from 'express';
import { ITenantService } from '@/services/tenant/ITenantService';
import { CreateTenantDto } from '@/validators/tenant/create.validator';

class TenantController {
  constructor(private tenantService: ITenantService) {}

  async create(
    req: Request<object, object, CreateTenantDto>,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { name, address } = req.body;
      const tenant = await this.tenantService.create({ name, address });
      return res.status(201).json(tenant);
    } catch (err) {
      next(err);
    }
  }

  async getAll(_req: Request, res: Response, next: NextFunction) {
    const { currentPage, perPage, q } = res.locals.validatedQuery;

    try {
      const [tenants, total] = await this.tenantService.findAll({ currentPage, perPage, q });
      return res.status(200).json({ currentPage, perPage, total, data: tenants });
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
      const tenant = await this.tenantService.update(
        req.params.id as string,
        req.body
      );
      return res.status(200).json(tenant);
    } catch (err) {
      next(err);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const tenant = await this.tenantService.delete(req.params.id as string);
      return res.status(200).json({ id: tenant.id });
    } catch (err) {
      next(err);
    }
  }
}

export default TenantController;
