import { Controller } from "@nestjs/common";
import { EventPattern, MessagePattern } from "@nestjs/microservices";
import { EmailData } from "../../../github-stack/src/github-ineraction/domain/interface/email.interface";
import { AppService } from "../services/app.service";

@Controller("send-email")
export class AppController {
  constructor(private readonly appService: AppService) {}

  @MessagePattern({ cmd: "send-email-to-emailService" })
  handleMessage(payload: EmailData) {
    return this.appService.sendLetter(payload);
  }
  // @MessagePattern({ cmd: "checking" })
  // seeDoesItWork(payload: any) {
  //   console.log(`I am here Bro ${payload}`);
  // }

  @EventPattern("send-redis-message")
  doesRedisWork(payload: any) {
    console.log(payload);
  }
}
