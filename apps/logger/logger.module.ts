import { DynamicModule, Module } from "@nestjs/common";
import { LoggerService } from "./logger.service";
import { ClientsModule, Transport } from "@nestjs/microservices";

@Module({
  imports: [
    ClientsModule.register([
      {
        name: "REDIS",
        transport: Transport.REDIS,
        options: {
          host: "redis",
          port: 6379,
        },
      },
    ]),
  ],
  providers: [LoggerService],
  exports: [LoggerService],
})
export class LoggerModule {
  static register(context: string): DynamicModule {
    return {
      module: LoggerModule,
      providers: [
        {
          provide: LoggerService,
          useValue: new LoggerService(context),
        },
      ],

      exports: [LoggerService],
    };
  }
}
