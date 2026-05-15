import { ITenant } from '@/entities/tenant/itenant.entity';
import { CreateTenantDto } from '@/validators/tenant/create.validator';
import { UpdateTenantDto } from '@/validators/tenant/update.validator';

export interface ITenantService {
  create(data: CreateTenantDto): Promise<ITenant>;
  findAll(): Promise<ITenant[]>;
  findById(id: string): Promise<ITenant>;
  update(id: string, data: UpdateTenantDto): Promise<ITenant>;
  delete(id: string): Promise<ITenant>;
}
