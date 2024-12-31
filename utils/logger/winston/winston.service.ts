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

  info(...args: any[]): void {
    this.winston.info(args)
  }
  debug(...args: any[]): void {
    this.winston.debug(args)
  }
  warn(...args: any[]): void {
   this.winston.warn(args);
  }
  error(...args: any[]): void {
    this.winston.error(args);
  }

}

export default WinstonService.getInstance();