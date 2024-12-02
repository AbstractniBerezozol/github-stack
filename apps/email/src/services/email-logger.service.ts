import { Inject, Injectable, OnModuleInit } from "@nestjs/common";
import * as fstat from "fs";
import { Redis } from "ioredis";
import * as path from "path";
import { InjectRedis } from "@nestjs-modules/ioredis";

@Injectable()
export class EmailLoggerService implements OnModuleInit {
  constructor(@InjectRedis() private readonly redisClient: Redis) {}

  async onModuleInit() {
    const subscriber = this.redisClient.duplicate();

    await subscriber.subscribe("email-log");

    subscriber.on("message", (channel, message) => {
      console.log(`Recieved message from ${channel}: ${message}`);

      const logFilePath = path.join(__dirname, "email-log.log");
      const logMessage = `${new Date().toISOString()} - ${message}\n`;
      fstat.appendFileSync(logFilePath, logMessage, "utf8");
    });
  }
}
