import { sortBy } from "lodash";
import { ELoggerDataOrder } from "./logger.enum";
import { ILoggerClientMethods, ILoggerData, ILoggerServiceMethods } from "./logger.type";
import winstonService from "./winston/winston.service";


class LoggingService implements ILoggerServiceMethods {
  private static instance: LoggingService;
  private loggerClient: ILoggerClientMethods;
  private loggerDataOrder;

  private constructor(params: ILoggerClientMethods) {
    this.loggerClient = params;
    this.loggerDataOrder = {
      correlationId: ELoggerDataOrder.correlationId,
      controller: ELoggerDataOrder.controller,
      serviceName: ELoggerDataOrder.serviceName,
      function: ELoggerDataOrder.function,
      message: ELoggerDataOrder.message,
      additionalArgs: ELoggerDataOrder.additionalArgs,
    };
  }

  public static getInstance(params: ILoggerClientMethods): LoggingService {
    if (!LoggingService.instance) {
      LoggingService.instance = new LoggingService(params);
    }

    return LoggingService.instance;
  }

  private formatter(data: ILoggerData): string {
    const orderAttribute = sortBy(Object.keys(data), key => this.loggerDataOrder[key as keyof typeof this.loggerDataOrder]);

    let finalMessage = orderAttribute.map(key => {
      return `${key}: ${data[key as keyof ILoggerData]}`;
    });

    return finalMessage.join('--->')
  }

  public info(message: ILoggerData | string): void {
    let formmatedMessage: string;

    if(typeof message !== 'string') {
      formmatedMessage = this.formatter(message);
    } else {
      formmatedMessage = message
    }

    this.loggerClient.info(formmatedMessage);
  }

  public debug(message: ILoggerData | string): void {
    let formmatedMessage: string;

    if(typeof message !== 'string') {
      formmatedMessage = this.formatter(message);
    } else {
      formmatedMessage = message
    }

    this.loggerClient.debug(formmatedMessage);
  }

  public warn(message: ILoggerData | string, option?: { error?: Error; }): void {
    let formmatedMessage: string;

    if(typeof message !== 'string') {
      formmatedMessage = this.formatter(message);
    } else {
      formmatedMessage = message
    }

    this.loggerClient.warn(formmatedMessage, option?.error);
  }

  public error(message: ILoggerData | string, option?: { error?: Error; }): void {
    let formmatedMessage: string;

    if(typeof message !== 'string') {
      formmatedMessage = this.formatter(message);
    } else {
      formmatedMessage = message
    }

    this.loggerClient.error(formmatedMessage, option?.error);
  }
}

export default LoggingService.getInstance(winstonService)