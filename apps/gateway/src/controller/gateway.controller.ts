import { Body, Controller, Post } from "@nestjs/common";
import { GatewayService } from "../service/gateway.service";
import { MessagePattern } from "@nestjs/microservices";
import { EmailDto } from "../../../email/src/emailDto";

@Controller()
export class GatewayController {
  constructor(private readonly gatewayService: GatewayService) {}

  @Post("send-email")
  async sendEmail(@Body() emailDto: EmailDto) {
    const pattern = { cmd: "send-email-to-emailService" };

    const payload = emailDto;

    return this.gatewayService.handleMessage(pattern, payload);
  }

  @MessagePattern({ cmd: "checking" })
  async messageCame(@Body() string: any) {
    console.log("LETS GOOOOOOOOOOOOOOOO");
    console.log(string);
    const messageToEmail = string;
    const pattern = { cmd: "checking" };
    // this.gatewayService.mockSending()
  }
}
