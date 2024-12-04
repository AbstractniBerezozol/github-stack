import { NestFactory } from "@nestjs/core";
import { MicroserviceOptions, Transport } from "@nestjs/microservices";
import { LoggerModule } from "./logger.module";
import { LoggerService } from "./logger.service";

async function bootstrap() {
  const app = await NestFactory.create(LoggerModule);

  const redisMicroservice = app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.REDIS,
    options: { host: "redis", port: 6379 },
  });
  console.log("Logger in the process");
  const logger = new LoggerService("logger");
  await app.startAllMicroservices();

  // app.useLogger(logger);
  // logger.log("Logger is working", "Bootstrap");

  app.listen(3003);
}

bootstrap();
