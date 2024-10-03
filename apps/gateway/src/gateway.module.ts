import { Module } from '@nestjs/common';
import { GatewayController } from './gateway.controller';
import { GatewayService } from './gateway.service';
import { ClientsModule, Transport } from '@nestjs/microservices';

@Module({
  imports: [ClientsModule.register([{
    name: 'EMAIL_SERVICE',
    transport: Transport.TCP,
    options: {
      host: '127.0.0.1',
      port: 3001,
    }
  }])],
  controllers: [GatewayController],
  providers: [GatewayService],
})
export class GatewayModule {}
