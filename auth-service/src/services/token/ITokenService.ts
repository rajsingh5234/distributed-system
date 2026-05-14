import { TokenPayload, RefreshTokenPayload, TokenResult } from '@/types/token';

export interface ITokenService {
  generateAccessToken(payload: TokenPayload): TokenResult;
  generateRefreshToken(payload: TokenPayload): Promise<TokenResult>;
  rotateRefreshToken(oldJwtid: string, payload: TokenPayload): Promise<TokenResult>;
  verifyAccessToken(token: string): TokenPayload;
  verifyRefreshToken(token: string): RefreshTokenPayload;
}
