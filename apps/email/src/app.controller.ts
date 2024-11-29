import { Controller } from "@nestjs/common";
import { AppService } from "./app.service";
import { EmailDto } from "./emailDto";
import { MessagePattern } from "@nestjs/microservices";
import { SubscribeMessage } from "@nestjs/websockets";
import { EmailData } from "../../github-stack/src/github-ineraction/domain/interface/email.interface";

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

  @MessagePattern({ cmd: "send-redis-message" })
  doesRedisWork(payload: any) {
    console.log(payload);
  }
}
