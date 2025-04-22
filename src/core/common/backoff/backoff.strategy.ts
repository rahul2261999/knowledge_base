import { Injectable } from '@nestjs/common';
import { LoggingService } from 'src/lib/logger/logger.service';
import { delay } from '@azure/service-bus';

export interface BackoffConfig {
  initialDelayMs: number;
  maxDelayMs: number;
  maxRetries: number;
  multiplier: number;
}

export const DEFAULT_BACKOFF_CONFIG: BackoffConfig = {
  initialDelayMs: 1000,
  maxDelayMs: 60000,
  maxRetries: 10,
  multiplier: 2,
};

@Injectable()
export class BackoffStrategy {
  private retryCount: number;
  private currentDelay: number;
  private readonly config: BackoffConfig;

  constructor(
    private readonly loggerService: LoggingService,
    config?: Partial<BackoffConfig>,
  ) {
    this.config = { ...DEFAULT_BACKOFF_CONFIG, ...config };
    this.reset();
  }

  public reset(): void {
    this.retryCount = 0;
    this.currentDelay = this.config.initialDelayMs;
  }

  public async execute<T>(
    operation: () => Promise<T>,
    context: { serviceName: string; functionName: string },
  ): Promise<T | null> {
    while (this.retryCount < this.config.maxRetries) {
      try {
        const result = await operation();
        this.reset();
        return result;
      } catch (error) {
        this.retryCount++;
        const isMaxRetriesReached = this.retryCount >= this.config.maxRetries;

        this.loggerService.error(
          {
            serviceName: context.serviceName,
            function: context.functionName,
            message: isMaxRetriesReached
              ? 'Max retries reached, stopping retry attempts'
              : `Operation failed (attempt ${this.retryCount}/${this.config.maxRetries}), retrying in ${this.currentDelay}ms...`,
            additionalArgs: {
              retryCount: this.retryCount,
              maxRetries: this.config.maxRetries,
              currentDelay: this.currentDelay,
              status: isMaxRetriesReached ? 'STOPPED' : 'RETRYING',
            },
          },
          { error },
        );

        if (isMaxRetriesReached) {
          return null;
        }

        await delay(this.currentDelay);

        // Calculate next retry delay with exponential backoff
        this.currentDelay = Math.min(
          this.currentDelay * this.config.multiplier,
          this.config.maxDelayMs,
        );
      }
    }

    return null;
  }
}
