import { Config } from '@/config';
import { expressjwt, Request } from 'express-jwt';

if (!Config.REFRESH_TOKEN_SECRET) {
  throw new Error('REFRESH_TOKEN_SECRET is not set in environment variables');
}

const refreshTokenSecret: string = Config.REFRESH_TOKEN_SECRET;

export default expressjwt({
  secret: refreshTokenSecret,
  algorithms: ['HS256'],

  getToken(req: Request): string | undefined {
    return req.cookies?.refreshToken;
  },
});
