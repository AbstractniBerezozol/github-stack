import { Injectable, Logger } from "@nestjs/common";
import { WebSocketServer } from "@nestjs/websockets";
import { Server } from "http";

@Injectable()
export class GatewayService {
  private logger = new Logger(GatewayService.name);

  @WebSocketServer()
  server: Server;
}
