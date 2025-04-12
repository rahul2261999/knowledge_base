import { Module } from '@nestjs/common';
import { TriggerService } from './triggers.service';

@Module({
  imports: [],
  providers: [TriggerService],
  exports: [TriggerService],
})
export class TriggerModule {}
