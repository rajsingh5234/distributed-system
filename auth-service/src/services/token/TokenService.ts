import jwt from 'jsonwebtoken';
import fs from 'fs';
import path from 'path';
import { Config } from '@/config';
import { IRefreshTokenRepository } from '@/repositories/refresh-token/IRefreshTokenRepository';
import { TokenPayload, RefreshTokenPayload, TokenResult } from '@/types/token';
import { ITokenService } from './ITokenService';

const TOKEN_EXPIRY = {
  ACCESS_TOKEN_1H_MS: 60 * 60 * 1000,
  REFRESH_TOKEN_7D_MS: 7 * 24 * 60 * 60 * 1000,
};

const loadKey = (filename: string): string => {
  const keyPath = path.resolve(`certs/${filename}`);
  if (!fs.existsSync(keyPath)) {
    throw new Error(`${filename} not found. Run: node scripts/generateKeys.mjs`);
  }
  return fs.readFileSync(keyPath, 'utf-8');
};

export class TokenService implements ITokenService {
  private privateKey: string;
  private publicKey: string;
  private refreshTokenSecret: string;

  constructor(private refreshTokenRepository: IRefreshTokenRepository) {
    this.privateKey = loadKey('private.pem');
    this.publicKey = loadKey('public.pem');
    if (!Config.REFRESH_TOKEN_SECRET) {
      throw new Error('REFRESH_TOKEN_SECRET is not set in environment variables');
    }
    this.refreshTokenSecret = Config.REFRESH_TOKEN_SECRET;
  }

  generateAccessToken(payload: TokenPayload): TokenResult {
    const token = jwt.sign({ ...payload, iss: 'auth-service' }, this.privateKey, {
      algorithm: 'RS256',
      expiresIn: '1h',
    });
    return { token, maxAge: TOKEN_EXPIRY.ACCESS_TOKEN_1H_MS };
  }

  async generateRefreshToken(payload: TokenPayload): Promise<TokenResult> {
    const record = await this.refreshTokenRepository.create({
      userId: payload.sub,
      expiresAt: new Date(Date.now() + TOKEN_EXPIRY.REFRESH_TOKEN_7D_MS),
    });
    const token = jwt.sign({ ...payload, iss: 'auth-service', jwtid: record.id }, this.refreshTokenSecret, {
      algorithm: 'HS256',
      expiresIn: '7d',
    });
    return { token, maxAge: TOKEN_EXPIRY.REFRESH_TOKEN_7D_MS };
  }

  async rotateRefreshToken(oldJwtid: string, payload: TokenPayload): Promise<TokenResult> {
    await this.refreshTokenRepository.deleteById(oldJwtid);
    return await this.generateRefreshToken(payload);
  }

  async revokeRefreshToken(jwtid: string): Promise<void> {
    await this.refreshTokenRepository.deleteById(jwtid);
  }

  verifyAccessToken(token: string): TokenPayload {
    return jwt.verify(token, this.publicKey, { algorithms: ['RS256'] }) as unknown as TokenPayload;
  }

  verifyRefreshToken(token: string): RefreshTokenPayload {
    return jwt.verify(token, this.refreshTokenSecret, { algorithms: ['HS256'] }) as unknown as RefreshTokenPayload;
  }
}
