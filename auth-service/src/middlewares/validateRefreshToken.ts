import { Config } from "@/config";
import { expressjwt, Request } from "express-jwt";
import { Jwt } from "jsonwebtoken";
import { RepositoryFactory } from "@/factories/repository.factory";
import { logger } from "@/factories/logger.factory";

if (!Config.REFRESH_TOKEN_SECRET) {
  throw new Error('REFRESH_TOKEN_SECRET is not set in environment variables');
}

const refreshTokenSecret: string = Config.REFRESH_TOKEN_SECRET;
const refreshTokenRepository = RepositoryFactory.createRefreshTokenRepository();

export default expressjwt({
  secret: refreshTokenSecret,
  algorithms: ['HS256'],

  getToken(req: Request): string | undefined {
    return req.cookies?.refreshToken;
  },

  async isRevoked(_req: Request, token: Jwt | undefined): Promise<boolean> {
    try {
      const payload = token?.payload as { jwtid?: string; sub?: string } | undefined;
      const jwtid = payload?.jwtid;
      const sub = payload?.sub;

      if (!jwtid || !sub) return true;

      const savedToken = await refreshTokenRepository.findById(jwtid);
      if (!savedToken) return true;

      const belongsToUser = savedToken.userId === sub;

      if (!belongsToUser) return true;
      return false;
    } catch (err) {
      logger.error(`Error checking token revocation: ${err}`);
      return true;
    }
  },
});
