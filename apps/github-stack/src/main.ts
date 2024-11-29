import { NestFactory } from "@nestjs/core";
import { GithubAppModule } from "./app.module";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { ValidationPipe } from "@nestjs/common";
import { MicroserviceOptions, Transport } from "@nestjs/microservices";

async function bootstrap() {
  const app = await NestFactory.create(GithubAppModule);

  const microservice = app.connectMicroservice({
    transport: Transport.TCP,
    options: { host: "github-stack", port: 3005 },
  });

  const redisMicroservice = app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.REDIS,
    options: { host: "redis", port: 6379 },
  });

  app.useGlobalPipes(new ValidationPipe());

  await app.startAllMicroservices();
  await app.listen(3000);
}
bootstrap();
