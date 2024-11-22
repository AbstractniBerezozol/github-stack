import { Controller } from "@nestjs/common";
import { GatewayService } from "../service/gateway.service";
import { MessagePattern } from "@nestjs/microservices";

@Controller()
export class GatewayController {
  constructor(private readonly gatewayService: GatewayService) {}

  // @Post("send-email")
  // async sendEmail(@Body() emailDto: EmailDto) {
  //   const pattern = { cmd: "send-email-to-emailService" };

  //   const payload = emailDto;

  //   return this.gatewayService.handleMessage(pattern, payload);
  // }

  @MessagePattern({ cmd: "checking" })
  async messageCame() {
    console.log("LETS GOOOOOOOOOOOOOOOO");
  }
}
