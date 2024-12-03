import { Test, TestingModule } from "@nestjs/testing";
import { describe, beforeEach, it } from "node:test";
import { LoggerController } from "./logger.controller";
import { LoggerService } from "./logger.service";
describe("LoggerController", () => {
  let logger2Controller: LoggerController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [LoggerController],
      providers: [LoggerService],
    }).compile();

    logger2Controller = app.get<LoggerController>(LoggerController);
  });

  describe("root", () => {
    it('should return "Hello World!"', () => {});
  });
});
