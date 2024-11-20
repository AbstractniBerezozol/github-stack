import { SubscribeMessage, WebSocketGateway } from "@nestjs/websockets";
import { EmailData } from "../../../../github-stack/src/github-ineraction/domain/interface/email.interface";
import { AppController } from "../../app.controller";

@WebSocketGateway()
export class EmailReceivingService {
  constructor(private readonly emailController: AppController) {}
  @SubscribeMessage("send-email")
  handleMessage(payload: EmailData) {
   return this.emailController.sendAnEmail(payload);
  }
}
