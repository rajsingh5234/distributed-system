import { ILogger } from './ILogger';

export class Logger {
  constructor(private loggerService: ILogger) {}

  info(message: string): void {
    this.loggerService.info(message);
  }

  error(message: string): void {
    this.loggerService.error(message);
  }

  warn(message: string): void {
    this.loggerService.warn(message);
  }

  debug(message: string): void {
    this.loggerService.debug(message);
  }
}
