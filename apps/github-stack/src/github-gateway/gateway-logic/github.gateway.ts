import {
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from "@nestjs/websockets";
import { Server } from "http";
import { EmailData } from "../../github-ineraction/domain/interface/email.interface";

@WebSocketGateway({ cors: { origin: "*" } })
export class EmailMessagingService {
  @WebSocketServer()
  server: Server;
  @SubscribeMessage("sendMessage")
  handleMessage(@MessageBody() email: EmailData) {
    return this.server.emit("send-email", email);
  }
}
