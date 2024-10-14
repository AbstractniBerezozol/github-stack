import { SubscribeMessage, WebSocketGateway } from "@nestjs/websockets";

@WebSocketGateway(3003)
export class GithubGateway {
  @SubscribeMessage("message")
  handleMessage(client: any, payload: any): string {
    return "Hello world!";
  }
}
