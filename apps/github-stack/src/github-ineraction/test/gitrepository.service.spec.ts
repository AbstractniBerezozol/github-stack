import { Test, TestingModule } from '@nestjs/testing';
import { GitrepositoryService } from '../service/gitrepository.service';

describe('GitrepositoryService', () => {
  let service: GitrepositoryService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GitrepositoryService],
    }).compile();

    service = module.get<GitrepositoryService>(GitrepositoryService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
