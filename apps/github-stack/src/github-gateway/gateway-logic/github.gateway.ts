import { MessageBody } from "@nestjs/websockets";
import { EmailData } from "../../github-ineraction/domain/interface/email.interface";
import { ClientProxy, MessagePattern } from "@nestjs/microservices";
import { Inject } from "@nestjs/common";

export class EmailMessagingService {
  constructor(@Inject("GATEWAY") private readonly clientGateway: ClientProxy) {}
  @MessagePattern({ cmd: "send-email" })
  handleMessage(@MessageBody() email: EmailData) {
    return this.clientGateway.send("send-email", email);
  }
}
