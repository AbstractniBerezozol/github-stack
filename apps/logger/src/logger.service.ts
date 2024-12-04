import { ConsoleLogger, Injectable } from "@nestjs/common";
import * as winston from "winston";
import "winston-daily-rotate-file";

@Injectable()
export class LoggerService extends ConsoleLogger {
  private readonly logger: winston.Logger;
  fs = require("node:fs/promises");

  constructor(context: string) {
    super(context);

    this.logger = winston.createLogger({
      level: "info",
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.simple()
      ),
      transports: [
        new winston.transports.DailyRotateFile({
          dirname: `logs/${context}/info`,
          filename: "%DATE%.log",
          datePattern: "YYYY-MM-DD",
          level: "info",
          zippedArchive: true,
        }),
        new winston.transports.DailyRotateFile({
          dirname: `logs/${context}/debug`,
          filename: "%DATE%.log",
          datePattern: "YYYY-MM-DD",
          level: "info",
          zippedArchive: true,
        }),
        new winston.transports.DailyRotateFile({
          dirname: `logs/${context}/error`,
          filename: "%DATE%-error.log",
          datePattern: "YYYY-MM-DD",
          level: "error",
          zippedArchive: true,
        }),
      ],
    });
  }

  log(message: string, context?: string) {
    this.logger.info(message, { context });
  }

  eror(message: string, trace: string, context?: string) {
    this.logger.error(message, { trace, context });
  }

  debug(message: string, context?: string) {
    this.logger.debug(message, { context });
  }

  async storeLogsIntoTheFile(payload: any) {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDay() + 1).padStart(2, "0");

    console.log(`logs/logger/info/${year}-${month}-${day}.log`);
    try {
      await this.fs.appendFile(
        `logs/logger/info/${year}-${month}-${day}.log`,
        `\n ${payload}`
      );
    } catch (err) {
      console.error(err);
    }
  }
}
