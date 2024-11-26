import { SubscribeMessage, WebSocketGateway } from "@nestjs/websockets";
import { EmailData } from "../../../../github-stack/src/github-ineraction/domain/interface/email.interface";
import { AppController } from "../../app.controller";
import { Controller } from "@nestjs/common";

@Controller()
export class EmailReceivingService {
  constructor(private readonly emailController: AppController) {}
  @SubscribeMessage("send-email-to-emailService")
  handleMessage(payload: EmailData) {
    return this.emailController.sendAnEmail(payload);
  }
  @SubscribeMessage("checking")
  seeDoesItWork(payload: any) {
    console.log(`I am here Bro ${payload}`);
  }
}
