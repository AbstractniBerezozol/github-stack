import { Body, Controller, Post } from '@nestjs/common';
import { AppService } from './app.service';
import { EmailDto } from './emailDto';

@Controller('send-email')
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Post('send-email')
  async sendAnEmail(@Body() emailDto: EmailDto) {
    return this.appService.sendLetter(emailDto);
  }
}
