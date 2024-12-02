import { Test, TestingModule } from "@nestjs/testing";
import { describe, beforeEach, it } from "node:test";
import { LoggerController } from "./logger2.controller";
import { LoggerService } from "./logger2.service";
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
