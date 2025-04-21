import { Module } from '@nestjs/common';
import { ServiceBusService } from './service-bus.service';

@Module({
  providers: [ServiceBusService],
})
export class ServiceBusModule {}
