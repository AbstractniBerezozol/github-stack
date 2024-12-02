import { NestFactory } from "@nestjs/core";
import { Transport } from "@nestjs/microservices";
import { LoggerModule } from "./logger2.module";
import { LoggerService } from "./logger2.service";



async function bootstrap() {
  const app = await NestFactory.createMicroservice(LoggerModule, {
    transport: Transport.REDIS,
    options: { host: "redis", port: 6379 },
  });
console.log('Logger in the process')
  const logger = new LoggerService("logger");
  app.useLogger(logger);

  logger.log("Logger is working", "Bootstrap");
}

bootstrap();
