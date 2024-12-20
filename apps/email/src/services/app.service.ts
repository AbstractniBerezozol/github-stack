import { MailerService } from "@nestjs-modules/mailer";
import { Inject, Injectable } from "@nestjs/common";
import { EmailDto } from "../domain/emailDto";
import { ClientProxy } from "@nestjs/microservices";

@Injectable()
export class AppService {
  constructor(
    @Inject("REDIS") private readonly redisClient: ClientProxy,
    private readonly emailService: MailerService
  ) {}
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
      const newLetterToRedis = JSON.stringify({
        event: "email_sent",
        details: { from, to, subject, text },
        timestamp: new Date().toISOString(),
      });
      await this.redisClient.send("email-log", newLetterToRedis);
      return newLetter;
    } catch (err) {
      console.log("New error", err);
      throw new Error("{{We are in trouble now}}");
    }
  }

  async seeDoesItWorkService(payload: any) {
    console.log(`You send it ${payload}`);
    try {
      console.log("Checking the logging");
      const newLetterToRedis = JSON.stringify({
        event: "email_sent",
        details: { payload },
        timestamp: new Date().toISOString(),
      });
      console.log(newLetterToRedis);
      this.redisClient.emit("email-log", newLetterToRedis).subscribe();
      return;
    } catch (err) {
      console.log("New error", err);
      throw new Error("{Redis wont take the logs!}");
    }
  }
}
