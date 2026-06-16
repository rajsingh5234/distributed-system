import { ILogger } from './ILogger';

export class Logger {
  constructor(private loggerService: ILogger) {}

  info(message: string, meta?: Record<string, unknown>): void {
    this.loggerService.info(message, meta);
  }

  error(message: string, meta?: Record<string, unknown>): void {
    this.loggerService.error(message, meta);
  }

  warn(message: string, meta?: Record<string, unknown>): void {
    this.loggerService.warn(message, meta);
  }

  debug(message: string, meta?: Record<string, unknown>): void {
    this.loggerService.debug(message, meta);
  }
}
