import { Module } from '@nestjs/common';
import { ServiceBusModule } from './service-bus/service-bus.module';
import { S3Module } from './s3/s3.module';

@Module({
  imports: [ServiceBusModule, S3Module],
  providers: [],
  exports: [ServiceBusModule, S3Module],
})
export class AzureModule {}
