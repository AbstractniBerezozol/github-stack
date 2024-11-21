import { Test, TestingModule } from '@nestjs/testing';
import { GatewayController } from '../controller/gateway.controller';
import { GatewayService } from '../service/gateway.service';

describe('GatewayController', () => {
  let gatewayController: GatewayController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [GatewayController],
      providers: [GatewayService],
    }).compile();

    gatewayController = app.get<GatewayController>(GatewayController);
  });

});
