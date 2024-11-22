import { Module } from "@nestjs/common";
import { UsersModule } from "./users/users.module";
import { AuthModule } from "./auth/auth.module";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { HttpModule } from "@nestjs/axios";
import { GithubInteractionModule } from "./github-ineraction/github-interaction.module";
import { ScheduleModule } from "@nestjs/schedule";
import { LoggerModule } from "../../logger/src/logger/logger.module";
import { GithubGatewayModule } from "./github-gateway/github-gateway.module";
import { ClientsModule, Transport } from "@nestjs/microservices";
@Module({
  imports: [
    LoggerModule.register("github-stack"),
    GithubInteractionModule,
    GithubGatewayModule,
    UsersModule,
    AuthModule,
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: "postgres",
        host: configService.get<string>("DB_HOST"),
        port: configService.get<number>("DB_PORT"),
        username: configService.get<string>("DB_USERNAME"),
        password: configService.get<string>("DB_PASSWORD"),
        database: configService.get<string>("DB_NAME"),
        autoLoadEntities: true,
        synchronize: true,
      }),
      inject: [ConfigService],
    }),
    ConfigModule.forRoot({ isGlobal: true }),
    HttpModule,
    ScheduleModule.forRoot(),
  ],
  controllers: [],
  providers: [],
  exports: [],
})
export class GithubAppModule {}
