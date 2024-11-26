import { NestFactory } from "@nestjs/core";
import { GithubAppModule } from "./app.module";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { ValidationPipe } from "@nestjs/common";
import { Transport } from "@nestjs/microservices";

async function bootstrap() {
  const app = await NestFactory.create(GithubAppModule);

  const microservice = app.connectMicroservice({
    transport: Transport.TCP,
    options: { host: "github-stack", port: 3005 },
  });

  // const options = new DocumentBuilder()
  //   .setTitle("GitHub Project")
  //   .setDescription("Praksa Applikacija")
  //   .setVersion("1.0")
  //   .build();

  // const document = SwaggerModule.createDocument(app, options);

  // SwaggerModule.setup("api", app, document);

  app.useGlobalPipes(new ValidationPipe());

  await app.startAllMicroservices();
  await app.listen(3000);
}
bootstrap();
