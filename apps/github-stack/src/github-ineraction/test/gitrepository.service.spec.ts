import { Test, TestingModule } from "@nestjs/testing";
import { GitrepositoryService } from "../service/gitrepository.service";
import { GitRepository } from "../domain/entity/repository.entity";
import { Repository } from "typeorm";
import { getRepositoryToken } from "@nestjs/typeorm";
import { User } from "../../users/domain/entity/user.entity";
import { UserRole } from "../../users/domain/enum/roles.enum";

const mockRepository = {
  findOne: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  find: jest.fn(),
  remove: jest.fn(),
  findOneOrFail: jest.fn(),
  createQueryBuilder: jest.fn(),
  where: jest.fn(),
};

describe("GitrepositoryService", () => {
  let service: GitrepositoryService;
  let gitRepository: Repository<GitRepository>;
  let userRepostory: Repository<User>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GitrepositoryService,
        {
          provide: getRepositoryToken(GitRepository),
          useValue: mockRepository,
        },
        { provide: getRepositoryToken(User), useValue: mockRepository },
      ],
    }).compile();

    service = module.get<GitrepositoryService>(GitrepositoryService);
    userRepostory = module.get<Repository<User>>(getRepositoryToken(User));
    gitRepository = module.get<Repository<GitRepository>>(
      getRepositoryToken(GitRepository)
    );
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("WatchlistQueryExample", () => {
    it("should return user watchlist", async () => {
      const mockedRepository: GitRepository = {
        id: 1,
        name: "mockingRepository",
        full_name: "alexander/mockingRepository",
        html_url: "https://github.com/alexander/mockingRepository",
        description: "Here is test repository for something incredible",
        language: "TypeScript",
        stargazers_count: 103,
        watchers_count: 6,
        forks_count: 10509,
        repoId: 23,
        user: new User(),
        releases: [],
      };
      const mockUser = {
        id: 1,
        username: "Coco",
        password: "Coco123",
        email: "Coco@singimail.rs",
        role: UserRole.USER,
        repositories: [],
      } as User;

      const queryBuilder: any = {
        innerJoin: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue(mockedRepository),
      };

      jest
        .spyOn(gitRepository, "createQueryBuilder")
        .mockReturnValue(queryBuilder);

      const result = await service.watchlistQueryExample(mockUser);

      expect(gitRepository.createQueryBuilder).toHaveBeenCalledWith(
        "git_repository"
      );
      expect(queryBuilder.innerJoin).toHaveBeenCalledWith(
        "git_repository.user",
        "user"
      );
      expect(queryBuilder.where).toHaveBeenCalledWith(
        "user.username= :username",
        { username: mockUser.username }
      );
      expect(queryBuilder.getMany).toHaveBeenCalled();
      expect(result).toEqual(mockedRepository);
    });
  });

  describe("checkForSameRepositories", () => {
    it("should log an error if repository is already added", async () => {
      const mockedRepository: GitRepository = {
        id: 1,
        name: "mockingRepository",
        full_name: "alexander/mockingRepository",
        html_url: "https://github.com/alexander/mockingRepository",
        description: "Here is test repository for something incredible",
        language: "TypeScript",
        stargazers_count: 103,
        watchers_count: 6,
        forks_count: 10509,
        repoId: 23,
        user: new User(),
        releases: [],
      };
      const consoleSpy = jest.spyOn(console, "error").mockImplementation();
      gitRepository.find = jest.fn().mockResolvedValue([
        {
          id: 1,
          name: "mockingRepository",
          full_name: "alexander/mockingRepository",
          html_url: "https://github.com/alexander/mockingRepository",
          description: "Here is test repository for something incredible",
          language: "TypeScript",
          stargazers_count: 103,
          watchers_count: 6,
          forks_count: 10509,
          repoId: 23,
          user: new User(),
          releases: [],
        },
      { id: 2,
        name: "mockingRepository",
        full_name: "alexander/mockingRepository",
        html_url: "https://github.com/alexander/mockingRepository",
        description: "Here is test repository for something incredible",
        language: "TypeScript",
        stargazers_count: 103,
        watchers_count: 6,
        forks_count: 10509,
        repoId: 23,
        user: new User(),
        releases: [],}
      ]);

      await service.checkForSameRepositories(mockedRepository);

      expect(gitRepository.find).toHaveBeenCalled();
      expect(consoleSpy).toHaveBeenCalledWith("Already added!");

      consoleSpy.mockRestore();
    });

    it("should not log an error if repository is not added already", async () => {
      const mockedRepository: GitRepository = {
        id: 1,
        name: "mockingRepository",
        full_name: "alexander/mockingRepository",
        html_url: "https://github.com/alexander/mockingRepository",
        description: "Here is test repository for something incredible",
        language: "TypeScript",
        stargazers_count: 103,
        watchers_count: 6,
        forks_count: 10509,
        repoId: 23,
        user: new User(),
        releases: [],
      };
      const consoleSpy = jest.spyOn(console, "error").mockImplementation();
      gitRepository.find = jest.fn().mockResolvedValue([
        {
          id: 2,
          name: "mockingRepository",
          full_name: "alexander/mockingRepository",
          html_url: "https://github.com/alexander/mockingRepository",
          description: "Here is test repository for something incredible",
          language: "TypeScript",
          stargazers_count: 103,
          watchers_count: 6,
          forks_count: 10509,
          repoId: 23,
          user: new User(),
          releases: [],
        },
      ]);

      await service.checkForSameRepositories(mockedRepository);

      expect(gitRepository.find).toHaveBeenCalledWith();
      expect(consoleSpy).not.toHaveBeenCalled();

      consoleSpy.mockRestore();
    });
  });
});
