import { Module } from "@nestjs/common";
import { ClientsModule, Transport } from "@nestjs/microservices";
import { EmailReceivingService } from "../email-gateway-logic/email.gateway";
import { AppService } from "../../app.service";

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
    ]),
  ],

  controllers: [EmailReceivingService],
  providers: [AppService],
  exports: [AppService],
})
export class EmailModule {}
