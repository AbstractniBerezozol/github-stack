import { NestFactory } from "@nestjs/core";
import { LoggerModule } from "./logger.module";
import { LoggerService } from "./logger.service";

async function bootstrap() {
  const app = await NestFactory.create(LoggerModule);

  const logger = new LoggerService("logger");
  app.useLogger(logger);

  await app.listen(3010);

  logger.log("Logger is working", "Bootstrap");
}

bootstrap();
