import { IRefreshToken } from '@/entities/refresh-token/irefresh-token.entity';
import { CreateRefreshTokenData } from '@/types/refresh-token';

export interface IRefreshTokenRepository {
  create(data: CreateRefreshTokenData): Promise<IRefreshToken>;
  findById(id: string): Promise<IRefreshToken | null>;
  deleteById(id: string): Promise<void>;
}
