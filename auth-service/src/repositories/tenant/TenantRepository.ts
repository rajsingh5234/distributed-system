import { ITenant } from '@/entities/tenant/itenant.entity';
import { TenantQueryParams } from '@/types/tenant';
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

  async findAll({ currentPage, perPage, q }: TenantQueryParams): Promise<[ITenant[], number]> {
    const query: Record<string, unknown> = {};

    if (q) {
      query.$or = [
        { name: { $regex: q, $options: 'i' } },
        { address: { $regex: q, $options: 'i' } },
      ];
    }

    const skip = (currentPage - 1) * perPage;

    const [data, total] = await Promise.all([
      TenantModel.find(query).skip(skip).limit(perPage).sort({ createdAt: -1 }),
      TenantModel.countDocuments(query),
    ]);

    return [data, total];
  }

  async update(id: string, data: UpdateTenantDto): Promise<ITenant | null> {
    return await TenantModel.findByIdAndUpdate(id, data, {
      returnDocument: 'after',
    });
  }

  async delete(id: string): Promise<ITenant | null> {
    return await TenantModel.findByIdAndDelete(id);
  }
}
