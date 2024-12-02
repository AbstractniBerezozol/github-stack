import { Controller } from "@nestjs/common";
import { EventPattern } from "@nestjs/microservices";

@Controller("logger")
export class LoggerController {
  @EventPattern("email-log")
  loggingTheMessage(payload: any) {
    console.log(payload);
  }
}
