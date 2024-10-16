import { Injectable } from "@nestjs/common";
import { MailerService } from "@nestjs-modules/mailer";
import { EmailDto } from "./emailDto";
import { MessagePattern } from "@nestjs/microservices";

@Injectable()
export class AppService {
  constructor(private readonly emailService: MailerService) {}
  @MessagePattern({ cmd: "send-email" })
  async sendLetter(emailDto: EmailDto) {
    const from = emailDto.from;
    const to = emailDto.to;
    const subject = emailDto.subject;
    const text = emailDto.text;
    const newLetter = {
      from,
      to,
      subject,
      text,
    };
    try {
      await this.emailService.sendMail(newLetter);
      console.log("Email was successfuly sent");
      return newLetter;
    } catch (err) {
      console.log("New error", err);
      throw new Error("{{We are in trouble now}}");
    }
  }
}
