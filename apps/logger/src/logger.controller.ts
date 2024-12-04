import { Controller } from "@nestjs/common";
import { EventPattern } from "@nestjs/microservices";
import { LoggerService } from "./logger.service";

@Controller("logger")
export class LoggerController {
  constructor(private readonly loggerService: LoggerService) {}
  @EventPattern("email-log")
  loggingTheMessage(payload: any) {
    console.log(payload);
    this.loggerService.storeLogsIntoTheFile(payload);
  }
}
