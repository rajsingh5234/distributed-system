import { Config } from '@/config';
import { expressjwt } from 'express-jwt';
import jwksClient from 'jwks-rsa';

if (!Config.JWKS_URI) {
  throw new Error('JWKS_URI is not set in environment variables');
}

export default expressjwt({
  secret: jwksClient.expressJwtSecret({
    jwksUri: Config.JWKS_URI,
    cache: true,
    rateLimit: true,
  }),
  algorithms: ['RS256'],
  getToken: (req) => {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      return authHeader.split(' ')[1];
    }
    if (req.cookies && req.cookies.accessToken) {
      return req.cookies.accessToken;
    }
    return null;
  },
});
