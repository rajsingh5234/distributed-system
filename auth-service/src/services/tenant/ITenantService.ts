import { ITenant } from '@/entities/tenant/itenant.entity';
import { TenantQueryParams } from '@/types/tenant';
import { CreateTenantDto } from '@/validators/tenant/create.validator';
import { UpdateTenantDto } from '@/validators/tenant/update.validator';

export interface ITenantService {
  create(data: CreateTenantDto): Promise<ITenant>;
  findAll(params: TenantQueryParams): Promise<[ITenant[], number]>;
  findById(id: string): Promise<ITenant>;
  update(id: string, data: UpdateTenantDto): Promise<ITenant>;
  delete(id: string): Promise<ITenant>;
}
