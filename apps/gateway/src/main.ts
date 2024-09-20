import { NestFactory } from '@nestjs/core';
import { GatewayModule } from './gateway.module';
import { Logger } from '@nestjs/common';

const logger = new Logger()


async function bootstrap() {
  const app = await NestFactory.createMicroservice(GatewayModule,);
  await app.listen();

  console.log('Gateway is running');
}
bootstrap();
