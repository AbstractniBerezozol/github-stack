import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication } from "@nestjs/common";
import * as request from "supertest";
import { LoggerModule } from "../src/logger.module";
import { beforeEach, describe, it } from "node:test";

describe("LoggerController (e2e)", () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [LoggerModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });
});
