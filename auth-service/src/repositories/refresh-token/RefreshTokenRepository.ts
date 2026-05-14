import { IRefreshToken } from '@/entities/refresh-token/irefresh-token.entity';
import { CreateRefreshTokenData } from '@/types/refresh-token';
import RefreshTokenModel from '@/entities/refresh-token/refresh-token.entity';
import { IRefreshTokenRepository } from './IRefreshTokenRepository';

export class RefreshTokenRepository implements IRefreshTokenRepository {
  async create(data: CreateRefreshTokenData): Promise<IRefreshToken> {
    return await RefreshTokenModel.create(data);
  }

  async findById(id: string): Promise<IRefreshToken | null> {
    return await RefreshTokenModel.findById(id);
  }

  async deleteById(id: string): Promise<void> {
    await RefreshTokenModel.findByIdAndDelete(id);
  }

}
