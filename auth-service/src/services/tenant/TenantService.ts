import { ITenant } from '@/entities/tenant/itenant.entity';
import { ITenantRepository } from '@/repositories/tenant/ITenantRepository';
import { CreateTenantDto } from '@/validators/tenant/create.validator';
import { ITenantService } from './ITenantService';
import createHttpError from 'http-errors';

export class TenantService implements ITenantService {
  constructor(private tenantRepository: ITenantRepository) {}

  async create(data: CreateTenantDto): Promise<ITenant> {
    return await this.tenantRepository.create(data);
  }

  async findAll(): Promise<ITenant[]> {
    return await this.tenantRepository.findAll();
  }

  async findById(id: string): Promise<ITenant> {
    const tenant = await this.tenantRepository.findById(id);
    if (!tenant) throw createHttpError(404, 'Tenant not found');
    return tenant;
  }
}
