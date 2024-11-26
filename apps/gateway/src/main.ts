import { NestFactory } from "@nestjs/core";
import { GatewayModule } from "./gateway.module";
import { Logger } from "@nestjs/common";
import { Transport } from "@nestjs/microservices";

const logger = new Logger();

async function bootstrap() {
  const app = await NestFactory.createMicroservice(GatewayModule, {
    transport: Transport.TCP,
    options: {
      host: "gateway",
      port: 3006,
    },
  });
  await app.listen();

  console.log("Gateway is running");
}
bootstrap();
