import { Logger } from '@/logging/Logger';
import { WinstonLogger } from '@/logging/WinstonLogger';

export class LoggerFactory {
  private static instance: Logger;

  static createLogger(): Logger {
    if (!LoggerFactory.instance) {
      LoggerFactory.instance = new Logger(new WinstonLogger());
    }
    return LoggerFactory.instance;
  }
}

export const logger = LoggerFactory.createLogger();
