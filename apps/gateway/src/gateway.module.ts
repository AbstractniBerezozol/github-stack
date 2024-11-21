import { Module } from "@nestjs/common";
import { ClientsModule, Transport } from "@nestjs/microservices";
import { GatewayController } from "./controller/gateway.controller";
import { GatewayService } from "./service/gateway.service";
import { EmailAppModule } from "../../email/src/app.module";
import { EmailMessagingService } from "../../github-stack/src/github-gateway/gateway-logic/github.gateway";
import { GithubInteractionModule } from "../../github-stack/src/github-ineraction/github-interaction.module";

@Module({
  imports: [
    ClientsModule.register([
      {
        name: "EMAIL_SERVICE",
        transport: Transport.TCP,
        options: {
          host: "email",
          port: 3001,
        },
      },
    ]),
    EmailAppModule, 
  ],
  controllers: [GatewayController],
  providers: [GatewayService],
  exports: [GatewayService],
})
export class GatewayModule {}
