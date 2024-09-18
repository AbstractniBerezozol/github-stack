import { Injectable, Logger } from '@nestjs/common';
import {  OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit, WebSocketServer, } from '@nestjs/websockets';
import { Socket } from 'dgram';
import { Server } from 'http';

@Injectable()
export class GatewayService implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect{
  private logger = new Logger(GatewayService.name);
  
  @WebSocketServer()
  server: Server;

  constructor(private readonly gatewayService: GatewayService){}
    afterInit(server: Server){
      this.logger.log(`Websocket initialized`)
    }

    handleConnection(client: Socket) {
      this.logger.log(`Client connected ${client}`)
    }

    handleDisconnect(client: Socket) {
      this.logger.log(`Client disconnected ${client}`)
    }
  }

