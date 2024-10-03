import { Body, Controller, Post } from "@nestjs/common";
import { AppService } from "./app.service";
import { EmailDto } from "./emailDto";
import { MessagePattern } from "@nestjs/microservices";

@Controller("send-email")
export class AppController {
  constructor(private readonly appService: AppService) {}

  @MessagePattern("emailSending")
  async sendAnEmail(emailDto: EmailDto): Promise<EmailDto> {
    return this.appService.sendLetter(emailDto);
  }
}
