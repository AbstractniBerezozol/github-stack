import { MessageBody } from "@nestjs/websockets";
import { EmailData } from "../../github-ineraction/domain/interface/email.interface";
import { ClientProxy, MessagePattern } from "@nestjs/microservices";
import { Inject } from "@nestjs/common";

export class EmailMessagingService {
  constructor(
    @Inject("GATEWAY") private readonly clientGateway: ClientProxy,
    @Inject("REDIS") private readonly redisClient: ClientProxy
  ) {}
  @MessagePattern({ cmd: "send-email" })
  handleMessage(pattern: Object, @MessageBody() email: EmailData) {
    return this.clientGateway.send(pattern, email).subscribe();
  }

  // checkingDoesItWork(message: any) {
  //   console.log("checkingDoesItWork");
  //   console.log(message);
  //   return this.clientGateway.send({ cmd: "checking" }, message).subscribe();
  // }

  checkingRedis(pattern: any, letter: any) {
    console.log("redis-2");
    return this.redisClient.emit(pattern, letter).subscribe();
  }
}
