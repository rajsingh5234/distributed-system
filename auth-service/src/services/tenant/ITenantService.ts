import { ITenant } from '@/entities/tenant/itenant.entity';
import { CreateTenantDto } from '@/validators/tenant/create.validator';

export interface ITenantService {
  create(data: CreateTenantDto): Promise<ITenant>;
}
