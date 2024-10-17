import { SubscribeMessage, WebSocketGateway } from "@nestjs/websockets";
import { EmailData } from "../../../../github-stack/src/github-ineraction/domain/interface/email.interface";
import { AppController } from "../../app.controller";

@WebSocketGateway()
export class EmailGateway {
  constructor(private readonly emailController: AppController) {}
  @SubscribeMessage("letter")
  handleMessage(client: any, payload: EmailData) {
    this.emailController.sendAnEmail(payload);
  }
}