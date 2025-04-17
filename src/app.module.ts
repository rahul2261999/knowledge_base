import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { LoggerModule } from './lib/logger/logger.module';
import { KnowledgebasesModule } from './features/knowledgebases/knowledgebases.module';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigurationModule } from './core/configuration/configuration.module';
import { ConfigurationService } from './core/configuration/configuration.service';
import { HealthModule } from './features/health/health.module';
import { FileProcessorModule } from './features/events/ingestion/file-processor.module';
import { AlsModule } from './core/common/als/als.module';
import { AlsService } from './core/common/als/als.service';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { TracingInterceptor } from './core/common/tracing.interceptor';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [
    ConfigurationModule,
    MongooseModule.forRootAsync({
      useFactory: async (configurationService: ConfigurationService) => ({
        uri: configurationService.getMongoUri(),
      }),
      inject: [ConfigurationService],
    }),
    LoggerModule,
    HealthModule,
    KnowledgebasesModule,
    FileProcessorModule,
    AlsModule,
    ScheduleModule.forRoot()
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_INTERCEPTOR,
      useClass: TracingInterceptor,
    },
  ],
})
export class AppModule implements NestModule {
  constructor(private readonly alsService: AlsService) {}

  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply((req, _, next) => {
        const traceId = req.headers['x-trace-id'];

        this.alsService.runContext(new Map(), () => {
          this.alsService.setTraceId(traceId);

          next();
        });
      })
      .forRoutes('*path');
  }
}
