import { Inject, Injectable, Logger } from "@nestjs/common";
import { ClientProxy, MessagePattern } from "@nestjs/microservices";
import { MessageBody } from "@nestjs/websockets";
import { EmailData } from "../../../github-stack/src/github-ineraction/domain/interface/email.interface";

@Injectable()
export class GatewayService {
  constructor(
    @Inject("EMAIL_SERVICE") private readonly clientEmailService: ClientProxy
  ) {}

  handleMessage(pattern: Object, @MessageBody() email: EmailData) {
    return this.clientEmailService.send(pattern, email);
  }
}
