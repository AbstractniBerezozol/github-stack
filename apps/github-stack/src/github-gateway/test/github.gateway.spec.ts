import { Test, TestingModule } from "@nestjs/testing";
import { GithubGatewayGateway } from "../gateway-logic/github.gateway";

describe("GithubGatewayGateway", () => {
  let gateway: GithubGatewayGateway;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GithubGatewayGateway],
    }).compile();

    gateway = module.get<GithubGatewayGateway>(GithubGatewayGateway);
  });

  it("should be defined", () => {
    expect(gateway).toBeDefined();
  });
});
