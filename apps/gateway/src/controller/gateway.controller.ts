import { Body, Controller, Get, Inject, Post } from "@nestjs/common";
import { ClientProxy } from "@nestjs/microservices";
import { EmailDto } from "../../../email/src/emailDto";
import { GatewayService } from "../service/gateway.service";

@Controller()
export class GatewayController {
  constructor(private readonly gatewayService: GatewayService) {}

  @Post("send-email")
  async sendEmail(@Body() emailDto: EmailDto) {
    const pattern = { cmd: "send-email-to-emailService" };

    const payload = emailDto;

    return this.gatewayService.handleMessage(pattern, payload);
  }
}
