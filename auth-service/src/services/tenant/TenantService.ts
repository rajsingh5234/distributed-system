import { ITenant } from '@/entities/tenant/itenant.entity';
import { ITenantRepository } from '@/repositories/tenant/ITenantRepository';
import { CreateTenantDto } from '@/validators/tenant/create.validator';
import { ITenantService } from './ITenantService';

export class TenantService implements ITenantService {
  constructor(private tenantRepository: ITenantRepository) {}

  async create(data: CreateTenantDto): Promise<ITenant> {
    return await this.tenantRepository.create(data);
  }
}
