import { Module } from "@nestjs/common";
import { ClientsModule, Transport } from "@nestjs/microservices";
import { GatewayController } from "./controller/gateway.controller";
import { GatewayService } from "./service/gateway.service";

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

      {
        name: "GITHUB_STACK_CLIENT",
        transport: Transport.TCP,
        options: {
          host: "github-stack",
          port: 3001,
        },
      },
    ]),
  ],
  controllers: [GatewayController],
  providers: [GatewayService],
  exports: [GatewayService],
})
export class GatewayModule {}
