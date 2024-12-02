import { NestFactory } from "@nestjs/core";
import { LoggerModule } from "./logger.module";
import { LoggerService } from "./logger.service";
import { Transport } from "@nestjs/microservices";

async function bootstrap() {
  const app = await NestFactory.createMicroservice(LoggerModule, {
    transport: Transport.REDIS,
    options: { host: "redis", port: 6379 },
  });

  const logger = new LoggerService("logger");
  app.useLogger(logger);

  logger.log("Logger is working", "Bootstrap");
}

bootstrap();
