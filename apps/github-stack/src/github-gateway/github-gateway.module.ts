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
          port: 3002,
        },
      },
    ]),
  ],

  controllers: [],
  providers: [EmailMessagingService],
})
export class GithubGatewayModule {}
