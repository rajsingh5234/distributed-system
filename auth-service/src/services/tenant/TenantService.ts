import { ITenant } from '@/entities/tenant/itenant.entity';
import { ITenantRepository } from '@/repositories/tenant/ITenantRepository';
import { TenantQueryParams } from '@/types/tenant';
import { CreateTenantDto } from '@/validators/tenant/create.validator';
import { UpdateTenantDto } from '@/validators/tenant/update.validator';
import { ITenantService } from './ITenantService';
import createHttpError from 'http-errors';

export class TenantService implements ITenantService {
  constructor(private tenantRepository: ITenantRepository) {}

  async create(data: CreateTenantDto): Promise<ITenant> {
    return await this.tenantRepository.create(data);
  }

  async findAll(params: TenantQueryParams): Promise<[ITenant[], number]> {
    return await this.tenantRepository.findAll(params);
  }

  async findById(id: string): Promise<ITenant> {
    const tenant = await this.tenantRepository.findById(id);
    if (!tenant) throw createHttpError(404, 'Tenant not found');
    return tenant;
  }

  async update(id: string, data: UpdateTenantDto): Promise<ITenant> {
    const tenant = await this.tenantRepository.update(id, data);
    if (!tenant) throw createHttpError(404, 'Tenant not found');
    return tenant;
  }

  async delete(id: string): Promise<ITenant> {
    const tenant = await this.tenantRepository.delete(id);
    if (!tenant) throw createHttpError(404, 'Tenant not found');
    return tenant;
  }
}
