import { Inject, Injectable } from "@nestjs/common";
import { ClientProxy } from "@nestjs/microservices";
import { MessageBody } from "@nestjs/websockets";
import { EmailData } from "../../../github-stack/src/github-ineraction/domain/interface/email.interface";

@Injectable()
export class GatewayService {
  constructor(
    @Inject("EMAIL_SERVICE") private readonly clientEmailService: ClientProxy
  ) {}

  handleMessage(pattern: Object, @MessageBody() email: any) {
    return this.clientEmailService.send(pattern, email).subscribe();
  }

  // mockSending() {
  //   try {
  //     console.log("Sending mock stuff");
  //     return this.clientEmailService
  //       .send({ cmd: "checking" }, "hello")
  //       .subscribe();
  //   } catch {
  //     throw new Error("Email could not be sent!");
  //   }
  // }
}
