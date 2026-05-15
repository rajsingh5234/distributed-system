import { ITenant } from '@/entities/tenant/itenant.entity';
import { CreateTenantDto } from '@/validators/tenant/create.validator';
import { UpdateTenantDto } from '@/validators/tenant/update.validator';
import TenantModel from '@/entities/tenant/tenant.entity';
import { ITenantRepository } from './ITenantRepository';

export class TenantRepository implements ITenantRepository {
  async create(data: CreateTenantDto): Promise<ITenant> {
    return await TenantModel.create(data);
  }

  async findById(id: string): Promise<ITenant | null> {
    return await TenantModel.findById(id);
  }

  async findAll(): Promise<ITenant[]> {
    return await TenantModel.find();
  }

  async update(id: string, data: UpdateTenantDto): Promise<ITenant | null> {
    return await TenantModel.findByIdAndUpdate(id, data, { returnDocument: 'after' });
  }

  async delete(id: string): Promise<ITenant | null> {
    return await TenantModel.findByIdAndDelete(id);
  }
}
