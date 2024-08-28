import { Body, Controller, Post } from '@nestjs/common';
import { AppService } from './app.service';
import { EmailDto } from './emailDto';

@Controller('sendingTestingEmail')
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Post('messageRequest')
  async sendAnEmail(@Body() emailDto: EmailDto) {
    return this.appService.sendLetter(emailDto);
  }
}
