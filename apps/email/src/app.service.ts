import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { EmailDto } from './emailDto';

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
    return this.emailService.sendMail(newLetter);
  }
}
