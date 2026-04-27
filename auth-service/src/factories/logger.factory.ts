import { Logger } from '../logging/Logger';
import { WinstonLogger } from '../logging/WinstonLogger';

export class LoggerFactory {
  static createLogger(): Logger {
    return new Logger(new WinstonLogger());
  }
}
