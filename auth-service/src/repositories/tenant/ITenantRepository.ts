import { ITenant } from '@/entities/tenant/itenant.entity';
import { CreateTenantDto } from '@/validators/tenant/create.validator';
import { UpdateTenantDto } from '@/validators/tenant/update.validator';

export interface ITenantRepository {
  create(data: CreateTenantDto): Promise<ITenant>;
  findById(id: string): Promise<ITenant | null>;
  findAll(): Promise<ITenant[]>;
  update(id: string, data: UpdateTenantDto): Promise<ITenant | null>;
}
