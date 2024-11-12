import { Test, TestingModule } from "@nestjs/testing";
import { EmailMessagingService } from "../gateway-logic/github.gateway";

describe("GithubGatewayGateway", () => {
  let gateway: EmailMessagingService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [EmailMessagingService],
    }).compile();

    gateway = module.get<EmailMessagingService>(EmailMessagingService);
  });

  it("should be defined", () => {
    expect(gateway).toBeDefined();
  });
});
