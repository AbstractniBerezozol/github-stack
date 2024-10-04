import { Body, Controller, Get, Inject, Post } from '@nestjs/common';
import { GatewayService } from './gateway.service';
import { ClientProxy, MessagePattern } from '@nestjs/microservices';
import { EmailDto } from '../../email/src/emailDto';

@Controller()
export class GatewayController {
  constructor(private readonly gatewayService: GatewayService,
     @Inject('EMAIL_SERVICE') private readonly client: ClientProxy,) {}



  @Post('send-email')
  async sendEmail(@Body() emailDto: EmailDto) {
    const pattern = {cmd: 'send-email'}

    const payload = emailDto

    return this.client.send(pattern, payload);
  }
}
