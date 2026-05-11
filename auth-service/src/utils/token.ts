import jwt from 'jsonwebtoken';
import fs from 'fs';
import path from 'path';
import { Config } from '@/config';

export interface TokenPayload {
  sub: string;
  role: string;
}

const loadKey = (filename: string): string => {
  const keyPath = path.resolve(`certs/${filename}`);
  if (!fs.existsSync(keyPath)) {
    throw new Error(`${filename} not found. Run: node scripts/generateKeys.mjs`);
  }
  return fs.readFileSync(keyPath, 'utf-8');
};

const privateKey = loadKey('private.pem');
const publicKey = loadKey('public.pem');

if (!Config.REFRESH_TOKEN_SECRET) {
  throw new Error('REFRESH_TOKEN_SECRET is not set in environment variables');
}
const refreshTokenSecret: string = Config.REFRESH_TOKEN_SECRET;

export class TokenService {

  static generateAccessToken(payload: TokenPayload): string {
    return jwt.sign({ ...payload, iss: 'auth-service' }, privateKey, {
      algorithm: 'RS256',
      expiresIn: '1h',
    });
  }

  static generateRefreshToken(payload: TokenPayload): string {
    return jwt.sign({ ...payload, iss: 'auth-service' }, refreshTokenSecret, {
      algorithm: 'HS256',
      expiresIn: '7d',
    });
  }

  static verifyAccessToken(token: string): TokenPayload {
    return jwt.verify(token, publicKey, { algorithms: ['RS256'] }) as unknown as TokenPayload;
  }

  static verifyRefreshToken(token: string): TokenPayload {
    return jwt.verify(token, refreshTokenSecret, { algorithms: ['HS256'] }) as unknown as TokenPayload;
  }
}
