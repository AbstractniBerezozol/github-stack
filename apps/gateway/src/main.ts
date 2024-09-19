import { NestFactory } from '@nestjs/core';
import { GatewayModule } from './gateway.module';
import { Logger } from '@nestjs/common';

const logger = new Logger()


async function bootstrap() {
  const app = await NestFactory.create(GatewayModule,);
  await app.listen(3002);

  console.log('Gateway is running');
}
bootstrap();
