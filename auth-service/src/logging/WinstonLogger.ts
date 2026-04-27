import winston from 'winston';
import { Config } from '../config';
import { ILogger } from './ILogger';

export class WinstonLogger implements ILogger {
  private logger: winston.Logger;

  constructor() {
    this.logger = winston.createLogger({
      level: 'info',
      defaultMeta: { serviceName: 'auth-service' },
      transports: [
        new winston.transports.File({
          dirname: 'logs',
          filename: 'combined.log',
          level: 'info',
          silent: Config.NODE_ENV === 'test',
          format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.json(),
          ),
        }),
        new winston.transports.File({
          dirname: 'logs',
          filename: 'error.log',
          level: 'error',
          silent: Config.NODE_ENV === 'test',
          format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.json(),
          ),
        }),
        new winston.transports.Console({
          level: 'info',
          silent: Config.NODE_ENV !== 'development',
          format: winston.format.combine(
            winston.format.colorize(),
            winston.format.timestamp(),
            winston.format.simple(),
          ),
        }),
      ],
    });
  }

  info(message: string): void {
    this.logger.info(message);
  }

  error(message: string): void {
    this.logger.error(message);
  }

  warn(message: string): void {
    this.logger.warn(message);
  }

  debug(message: string): void {
    this.logger.debug(message);
  }
}
