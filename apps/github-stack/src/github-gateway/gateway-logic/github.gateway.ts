import {
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from "@nestjs/websockets";
import { Server } from "http";
import { EmailData } from "../../github-ineraction/domain/interface/email.interface";

@WebSocketGateway({ cors: { origin: "*" } })
export class GithubGateway {
  @WebSocketServer()
  server: Server;
  @SubscribeMessage("sending-letter")
  handleMessage(@MessageBody() email: EmailData) {
    return this.server.emit("send-email", email);
  }
}
