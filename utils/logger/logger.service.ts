import { sortBy } from "lodash";
import { ELoggerDataOrder } from "./logger.enum";
import { ILoggerClientMethods, ILoggerData, ILoggerServiceMethods } from "./logger.type";
import winstonService from "./winston/winston.service";
import { asyncLocalStorage } from "../helper/store.util";


class LoggingService implements ILoggerServiceMethods {
  private static instance: LoggingService;
  private loggerClient: ILoggerClientMethods;
  private loggerDataOrder;

  private constructor(loggerCient: ILoggerClientMethods) {
    this.loggerClient = loggerCient;
    
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

  private getCorrelationId() {
    const store = asyncLocalStorage.getStore();
    const correlationId = store?.get('correlationId') ?? '-';

    return correlationId;
  }

  public info(message: ILoggerData | string): void {
    

    let formmatedMessage: string = `correlationId: ${this.getCorrelationId()} --> `;

    if (typeof message !== 'string') {
      formmatedMessage += this.formatter(message);
    } else {
      formmatedMessage += message
    }

    this.loggerClient.info(formmatedMessage);
  }

  public debug(message: ILoggerData | string): void {
    let formmatedMessage: string = `correlationId: ${this.getCorrelationId()} --> `;

    if (typeof message !== 'string') {
      formmatedMessage += this.formatter(message);
    } else {
      formmatedMessage += message
    }

    this.loggerClient.debug(formmatedMessage);
  }

  public warn(message: ILoggerData | string | null, option?: { error?: Error; }): void {
    let formmatedMessage: string = `correlationId: ${this.getCorrelationId()} --> `;

    if (message !== null) {
      if (typeof message !== 'string') {
        formmatedMessage += this.formatter(message);
      } else {
        formmatedMessage += message
      }
    }

    this.loggerClient.warn(formmatedMessage, option?.error);
  }

  public error(message: ILoggerData | string | null, option?: { error?: Error; }): void {
    const store = asyncLocalStorage.getStore();
    const correlationId = store?.get('correlationId') ?? '-';

    let formmatedMessage: string = `correlationId: ${this.getCorrelationId()} --> `;

    if (message !== null) {
      if (typeof message !== 'string') {
        formmatedMessage += this.formatter(message);
      } else {
        formmatedMessage = message
      }
    }

    this.loggerClient.error(formmatedMessage, option?.error);
  }
}

export default LoggingService.getInstance(winstonService)