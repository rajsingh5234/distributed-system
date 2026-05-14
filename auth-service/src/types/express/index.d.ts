import { TokenPayload } from '@/types/token';

declare global {
  namespace Express {
    interface Request {
      auth?: TokenPayload;
    }
  }
}
