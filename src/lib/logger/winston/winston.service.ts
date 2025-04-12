import { Injectable } from '@nestjs/common';
import { ILoggerClientMethods } from '../logger.type';
import * as Winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';

@Injectable()
class WinstonService implements ILoggerClientMethods {
  private readonly winston: Winston.Logger;

  constructor() {
    this.winston = Winston.createLogger({
      levels: {
        error: 0,
        info: 1,
        debug: 2,
        warn: 3,
      },
      level: 'warn',
      format: Winston.format.combine(
        Winston.format.timestamp({ format: 'DD-MM-YYYY HH:mm:ss' }),
        Winston.format.colorize({ all: true }),
        Winston.format.printf(
          (info) => `${info.timestamp} ${info.level}: ${info.message}`,
        ),
        Winston.format.errors({ stack: true }),
      ),
      transports: [
        new Winston.transports.Console(),
        new DailyRotateFile({
          dirname: './logs',
          filename: '%DATE%.log',
          datePattern: 'YYYY-MM-DD',
          zippedArchive: true,
          maxSize: '20m',
          maxFiles: '14d',
        }),
      ],
    });
  }

  public info(...args: any[]): void {
    args.forEach((arg) => this.winston.info(arg));
  }
  public debug(...args: any[]): void {
    args.forEach((arg) => this.winston.debug(arg));
  }
  public warn(...args: any[]): void {
    args.forEach((arg) => this.winston.warn(arg));
  }
  public error(...args: any[]): void {
    args.forEach((arg) => arg && this.winston.error(arg, arg?.stack));
  }
}

export { WinstonService };
