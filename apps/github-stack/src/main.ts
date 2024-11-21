import { NestFactory } from "@nestjs/core";
import { GithubAppModule } from "./app.module";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { ValidationPipe } from "@nestjs/common";
import { Transport } from "@nestjs/microservices";

async function bootstrap() {
  const app = await NestFactory.createMicroservice(GithubAppModule, {
    transport: Transport.TCP,
    options: {
      host: "github-stack",
      port: 3000,
    },
  });
  const options = new DocumentBuilder()
    .setTitle("GitHub Project")
    .setDescription("Praksa Applikacija")
    .setVersion("1.0")
    .build();

  // const document = SwaggerModule.createDocument(app, options);

  // SwaggerModule.setup("api", app, document);
  // app.useGlobalPipes(new ValidationPipe());

  await app.listen();
}
bootstrap();
