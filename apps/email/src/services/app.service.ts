import { MailerService } from "@nestjs-modules/mailer";
import { Injectable } from "@nestjs/common";
import { EmailDto } from "../domain/emailDto";

@Injectable()
export class AppService {
  constructor(private readonly emailService: MailerService) {}
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


  seeDoesItWorkService(payload: any) {
    console.log(`I am here Bro ${payload}`);
  }
}
