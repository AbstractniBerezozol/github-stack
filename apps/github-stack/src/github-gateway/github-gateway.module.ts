import { Module } from "@nestjs/common";
import { ClientsModule, Transport } from "@nestjs/microservices";
import { EmailMessagingService } from "./gateway-logic/github.gateway";

@Module({
  imports: [
    ClientsModule.register([
      {
        name: "GATEWAY",
        transport: Transport.TCP,
        options: {
          host: "gateway",
          port: 3006,
        },
      },
      {
        name: "EMAIL_SERVICE",
        transport: Transport.TCP,
        options: {
          host: "email",
          port: 3001,
        },
      },
      {
        name: "REDIS",
        transport: Transport.REDIS,
        options: {
          host: "redis",
          port: 6279,
        },
      },
    ]),
  ],

  controllers: [],
  providers: [EmailMessagingService],
  exports: [EmailMessagingService],
})
export class GithubGatewayModule {}
