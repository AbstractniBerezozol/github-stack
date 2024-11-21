import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { MailerModule } from "@nestjs-modules/mailer";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { HttpModule, HttpService } from "@nestjs/axios";
import { LoggerModule } from "../../logger/src/logger/logger.module";
import { ClientsModule, Transport } from "@nestjs/microservices";
import { GatewayModule } from "../../gateway/src/gateway.module";

@Module({
  imports: [
    HttpModule,
    ConfigModule.forRoot({ envFilePath: ".env", isGlobal: true }),
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        transport: {
          host: configService.get<string>("EMAIL_HOST"),
          port: configService.get<number>("PORTS_NUMBER"),
          auth: {
            user: configService.get<string>("EMAIL_USERNAME"),
            pass: configService.get<string>("EMAIL_PASSWORD"),
          },
        },
        defaults: {
          from: `DON'T OPEN IT FROM <${configService.get<string>("EMAIL_FROM")}`,
        },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
  exports: [AppService],
})
export class EmailAppModule {}
