import { NestFactory } from "@nestjs/core";
import { EmailAppModule } from "./app.module";
import { Transport } from "@nestjs/microservices";

async function bootstrap() {
  const app = await NestFactory.createMicroservice(EmailAppModule, {
    transport: Transport.TCP,
    options: {
      host: "email",
      port: 3007,
    },
  });

  
  await app.listen();
  console.log("Email microservice is running");
}
bootstrap();
