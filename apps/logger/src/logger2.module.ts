import { DynamicModule, Module } from "@nestjs/common";
import { ClientsModule, Transport } from "@nestjs/microservices";
import { LoggerController } from "./logger2.controller";
import { LoggerService } from "./logger2.service";

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
  controllers: [LoggerController],
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