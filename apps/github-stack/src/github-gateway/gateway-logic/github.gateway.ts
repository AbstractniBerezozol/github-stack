import { SubscribeMessage, WebSocketGateway } from "@nestjs/websockets";

@WebSocketGateway(3003)
export class GithubGatewayGateway {
  @SubscribeMessage("message")
  handleMessage(client: any, payload: any): string {
    return "Hello world!";
  }
}
