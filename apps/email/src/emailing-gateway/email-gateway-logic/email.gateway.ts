import { SubscribeMessage, WebSocketGateway } from "@nestjs/websockets";
import { EmailData } from "../../../../github-stack/src/github-ineraction/domain/interface/email.interface";
import { AppController } from "../../app.controller";

@WebSocketGateway(88, { namespace: "send-email" })
export class EmailGateway {
  constructor(private readonly emailController: AppController) {}
  @SubscribeMessage("send-email")
  handleMessage(payload: EmailData) {
    this.emailController.sendAnEmail(payload);
  }
}
