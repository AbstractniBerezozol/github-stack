import { HttpModule } from "@nestjs/axios";
import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { JwtModule } from "@nestjs/jwt";
import { TypeOrmModule } from "@nestjs/typeorm";
import { GithubGatewayModule } from "../github-gateway/github-gateway.module";
import { User } from "../users/domain/entity/user.entity";
import { GithubInteractionController } from "./controller/github-interaction.controller";
import { Release } from "./domain/entity/release.entity";
import { GitRepository } from "./domain/entity/repository.entity";
import { GitHubScheduler } from "./domain/scheduler/github-scheduler";
import { GithubIneractionService } from "./service/github-ineraction.service";
import { GitrepositoryService } from "./service/gitrepository.service";
import { SendingEmailService } from "./service/sending-email.service";

@Module({
  imports: [
    TypeOrmModule.forFeature([User, GitRepository, Release]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>("JWT_SECRET"),
        signOptions: { expiresIn: "1h" },
      }),
      inject: [ConfigService],
    }),
    HttpModule,
    GithubGatewayModule,
  ],
  controllers: [GithubInteractionController],
  providers: [
    GitrepositoryService,
    GithubIneractionService,
    GitHubScheduler,
    SendingEmailService,
  ],
  exports: [SendingEmailService],
})
export class GithubInteractionModule {}
