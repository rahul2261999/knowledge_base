import { ILoggerClientMethods } from "../logger.type";
import * as Winston from 'winston';

class WinstonService implements ILoggerClientMethods {
  private static instance: WinstonService;
  private winston: Winston.Logger;

  public static getInstance(): WinstonService {
    if (!WinstonService.instance) {
      WinstonService.instance = new WinstonService();
    }
    return WinstonService.instance;
  }

  private constructor() {
    this.winston = Winston.createLogger({
      levels: {
        'error': 0,
        'info': 1,
        'debug': 2,
        'warn': 3,
      },
      level: 'warn',
      format: Winston.format.combine(
        Winston.format.timestamp({
          format: 'DD-MM-YYYY HH:mm:ss',
        }),
        Winston.format.colorize({
          all: true,
        }),
        Winston.format.printf(info => `${info.timestamp} ${info.level}: ${info.message}`)
      ),
      transports: [
        new Winston.transports.Console(),
      ],
    })
  }

  public info(...args: any[]): void {
    args.forEach(args => this.winston.info(args))
  }
  public debug(...args: any[]): void {
    args.forEach(args => this.winston.debug(args))
  }
  public warn(...args: any[]): void {
    args.forEach(args => this.winston.warn(args))
  }
  public error(...args: any[]): void {
    args.forEach(args => args && this.winston.error(args.toString()))
  }

}

export default WinstonService.getInstance();