import { MailerModule } from "@nestjs-modules/mailer";
import { HttpModule } from "@nestjs/axios";
import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { AppController } from "./controller/app.controller";
import { AppService } from "./services/app.service";
import { EmailLoggerService } from "./services/email-logger.service";
import { ClientsModule, Transport } from "@nestjs/microservices";

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
  providers: [AppService, EmailLoggerService],
  exports: [AppService, ],
})
export class EmailAppModule {}
