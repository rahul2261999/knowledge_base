import { Injectable } from '@nestjs/common';
import { sortBy } from 'lodash';
import { ELoggerDataOrder } from './logger.enum';
import { ILoggerData, ILoggerServiceMethods } from './logger.type';
import { WinstonService } from './winston/winston.service';
import { AlsService } from 'src/core/common/als/als.service';

@Injectable()
export class LoggingService implements ILoggerServiceMethods {
  private loggerDataOrder = {
    controller: ELoggerDataOrder.controller,
    serviceName: ELoggerDataOrder.serviceName,
    function: ELoggerDataOrder.function,
    message: ELoggerDataOrder.message,
    additionalArgs: ELoggerDataOrder.additionalArgs,
  };

  constructor(
    private readonly loggerClient: WinstonService,
    private readonly alsService: AlsService,
  ) {}

  private formatter(data: ILoggerData): string {
    const orderAttribute = sortBy(
      Object.keys(data),
      (key) => this.loggerDataOrder[key as keyof typeof this.loggerDataOrder],
    );

    const finalMessage = orderAttribute.map((key) => {
      const value = data[key as keyof ILoggerData];
      if (value instanceof Object) {
        return `${key}: ${JSON.stringify(value, null, 2)}`;
      }
      return `${key}: ${value}`;
    });

    return finalMessage.join(' ---> ');
  }

  private getTracingId() {
    return this.alsService.getTraceId();
  }

  public info(message: ILoggerData | string): void {
    const tracingId = this.getTracingId();
    let formattedMessage: string = tracingId
      ? `tracingId: ${tracingId} --> `
      : '';

    formattedMessage +=
      typeof message !== 'string' ? this.formatter(message) : message;
    this.loggerClient.info(formattedMessage);
  }

  public debug(message: ILoggerData | string): void {
    const tracingId = this.getTracingId();
    let formattedMessage: string = tracingId
      ? `tracingId: ${tracingId} --> `
      : '';

    formattedMessage +=
      typeof message !== 'string' ? this.formatter(message) : message;
    this.loggerClient.debug(formattedMessage);
  }

  public warn(
    message: ILoggerData | string | null,
    option?: { error?: Error },
  ): void {
    const tracingId = this.getTracingId();
    let formattedMessage: string = tracingId
      ? `tracingId: ${tracingId} --> `
      : '';

    if (message !== null) {
      formattedMessage +=
        typeof message !== 'string' ? this.formatter(message) : message;
    }

    this.loggerClient.warn(formattedMessage, option?.error);
  }

  public error(
    message: ILoggerData | string | null,
    option?: { error?: Error },
  ): void {
    const tracingId = this.getTracingId();
    let formattedMessage: string = tracingId
      ? `tracingId: ${tracingId} --> `
      : '';

    if (message !== null) {
      formattedMessage +=
        typeof message !== 'string' ? this.formatter(message) : message;
    }

    this.loggerClient.error(formattedMessage, option?.error);
  }
}
