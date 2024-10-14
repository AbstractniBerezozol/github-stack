import { Test, TestingModule } from "@nestjs/testing";
import { GithubGateway } from "../gateway-logic/github.gateway";

describe("GithubGatewayGateway", () => {
  let gateway: GithubGateway;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GithubGateway],
    }).compile();

    gateway = module.get<GithubGateway>(GithubGateway);
  });

  it("should be defined", () => {
    expect(gateway).toBeDefined();
  });
});
