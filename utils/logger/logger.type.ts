export interface ILoggerServiceMethods {
  info(data: ILoggerData): void;
  debug(data: ILoggerData): void;
  warn(data: ILoggerData, option?: { error?: Error }): void;
  error(data: ILoggerData, option?: { error?: Error }): void;
}

export interface ILoggerClientMethods {
  warn(...args: any[]): void;
  info(...args: any[]): void;
  debug(...args: any[]): void;
  warn(...args: any[]): void;
  error(...args: any[]): void;
}

export interface ILoggerData {
  correlationId: string;
  controller?: string;
  serviceName?: string;
  function?: string;
  message?: string;
  additionalArgs?: any
}