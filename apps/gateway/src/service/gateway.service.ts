import { Inject, Injectable } from "@nestjs/common";
import { ClientProxy } from "@nestjs/microservices";

@Injectable()
export class GatewayService {
  constructor(
    @Inject("EMAIL_SERVICE") private readonly clientEmailService: ClientProxy
  ) {}

  // handleMessage(pattern: Object, @MessageBody() email: EmailData) {
  //   return this.clientEmailService.send(pattern, email);
  // }
}
