import { Module } from '@nestjs/common';
import { BackoffStrategy } from './backoff.strategy';

@Module({
  providers: [BackoffStrategy],
  exports: [BackoffStrategy],
})
export class BackoffModule {}
