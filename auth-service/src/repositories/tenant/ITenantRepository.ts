import { ITenant } from '@/entities/tenant/itenant.entity';
import { CreateTenantDto } from '@/validators/tenant/create.validator';

export interface ITenantRepository {
  create(data: CreateTenantDto): Promise<ITenant>;
  findById(id: string): Promise<ITenant | null>;
  findAll(): Promise<ITenant[]>;
}
