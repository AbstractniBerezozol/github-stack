import { NestFactory } from "@nestjs/core";
import { EmailAppModule } from "./app.module";
import { MicroserviceOptions, Transport } from "@nestjs/microservices";

async function bootstrap() {
  const app = await NestFactory.create(EmailAppModule);

  const emailMicroservice = app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.TCP,
    options: {
      host: "email",
      port: 3007,
    },
  });
  const redisMicroservice = app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.REDIS,
    options: { host: "redis", port: 6379 },
  });
  await app.startAllMicroservices();
  await app.listen(3001);
  console.log("Email microservice is running");
}
bootstrap();
