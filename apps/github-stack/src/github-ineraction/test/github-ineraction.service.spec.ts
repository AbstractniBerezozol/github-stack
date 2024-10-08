import { HttpService } from "@nestjs/axios";
import { HttpException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Test, TestingModule } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import { of } from "rxjs";
import { Repository } from "typeorm";
import { User } from "../../users/domain/entity/user.entity";
import { UserRole } from "../../users/domain/enum/roles.enum";
import { GitRepository } from "../domain/entity/repository.entity";
import { SearchBy } from "../domain/enum/repository.enum";
import { GithubIneractionService } from "../service/github-ineraction.service";
import { GitrepositoryService } from "../service/gitrepository.service";
import { Release } from "../domain/entity/release.entity";
import { get } from "http";

const mockHttpService = {
  get: jest.fn(),
  post: jest.fn(),
};

enum mockSearchBy {
  name = "name",
  description = "description",
  topics = "topics",
  readme = "readme",
  repoOwner = "repoOwner",
}

const mockConfigService = {
  get: jest.fn().mockReturnValue("mocked_github_token"),
};

const mockRepository = {
  findOne: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  find: jest.fn(),
  remove: jest.fn(),
  findOneOrFail: jest.fn(),
  createQueryBuilder: jest.fn(),
};

const mockGitServ = {
  WatchlistQueryExample: jest.fn(),
};

const mockReleaseRepository = {
  create: jest.fn(),
};

describe("GithubIneractionService", () => {
  let githubInteractionService: GithubIneractionService;
  let httpService: HttpService;
  let configService: ConfigService;
  let userRepostory: Repository<User>;
  let gitRepository: Repository<GitRepository>;
  let gitServ: GitrepositoryService;
  let releaseRep: Repository<Release>;

  beforeEach(async () => {
    jest.spyOn(console, "error").mockImplementation(() => {});
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GithubIneractionService,
        { provide: HttpService, useValue: mockHttpService },
        { provide: ConfigService, useValue: mockConfigService },
        { provide: getRepositoryToken(User), useValue: mockRepository },
        {
          provide: getRepositoryToken(GitRepository),
          useValue: mockRepository,
        },
        { provide: GitrepositoryService, useValue: mockGitServ },
        {
          provide: getRepositoryToken(Release),
          useValue: mockReleaseRepository,
        },
      ],
    }).compile();

    githubInteractionService = module.get<GithubIneractionService>(
      GithubIneractionService
    );
    httpService = module.get<HttpService>(HttpService);
    configService = module.get<ConfigService>(ConfigService);
    userRepostory = module.get<Repository<User>>(getRepositoryToken(User));
    gitRepository = module.get<Repository<GitRepository>>(
      getRepositoryToken(GitRepository)
    );
    gitServ = module.get<GitrepositoryService>(GitrepositoryService);
    releaseRep = module.get<Repository<Release>>(getRepositoryToken(Release));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should be defined", () => {
    expect(githubInteractionService).toBeDefined();
  });

  describe("searchRepositories", () => {
    it("should search repositories by name", async () => {
      const mockResponse = {
        data: {
          items: [
            { id: 1, name: "repo1" },
            { id: 2, name: "repo2" },
          ],
        },
      };
      mockHttpService.get.mockReturnValue({
        toPromise: () => Promise.resolve(mockResponse),
      });

      const result = await githubInteractionService.searchRepositories(
        SearchBy.name,
        "repo1",
        ""
      );
      expect(mockHttpService.get).toHaveBeenCalledWith(
        "https://api.github.com/search/repositories?q=name:repo1"
      );
      expect(result).toEqual(mockResponse.data.items);
    });
    it("should handle errors during repos search", async () => {
      mockHttpService.get.mockReturnValue({
        toPromise: () => Promise.reject("API ERROR"),
      });
      await expect(
        githubInteractionService.searchRepositories(SearchBy.name, "repo1", "")
      ).rejects.toThrowError(HttpException);
    });
  });

  describe("addRepository", () => {
    it("should add repository to the watchlist", async () => {
      const mockUser = {
        id: 1,
        username: "Coco",
        password: "Coco123",
        email: "Coco@singimail.rs",
        role: UserRole.USER,
        repositories: [],
        deletedDate: undefined,
        deleted: false,
      };
      const mockRepoId = 12345;
      const mockResponse = {
        data: {
          id: mockRepoId,
          name: "mockingRepository",
          full_name: "alexander/mockingRepository",
          html_url: "https://github.com/alexander/mockingRepository",
          description: "Here is test repository for something incredible",
          language: "TypeScript",
          stargazers_count: 103,
          watchers_count: 6,
          forks_count: 10509,
          latestRelease: "v1.7.19",
        },
      };

      mockHttpService.get.mockReturnValue(of(mockResponse));

      mockRepository.find.mockResolvedValue([mockRepository]);
      mockRepository.create.mockReturnValue({ id: 1, repoId: mockRepoId });
      mockRepository.save.mockResolvedValue({ id: 1, repoId: mockRepoId });

      const result = await githubInteractionService.addRepository(
        mockRepoId,
        mockUser
      );
      expect(result.length).toBeGreaterThan(0);
      expect(mockRepository.save).toHaveBeenCalled();
    });
    it("should handle errors during repos adding", async () => {
      const mockUser = {
        id: 1,
        username: "Coco",
        password: "Coco123",
        email: "Coco@singimail.rs",
        role: UserRole.USER,
        repositories: [],
        deletedDate: undefined,
        deleted: false,
      };
      const mockRepoId = 12345;
      mockHttpService.get.mockReturnValue({
        toPromise: () => Promise.reject("API ERROR"),
      });
      mockRepository.findOne.mockRejectedValue(mockUser);

      await expect(
        githubInteractionService.addRepository(mockRepoId, mockUser)
      ).rejects.toThrowError();
    });
  });

  describe("deleteRepository", () => {
    it("should delete Repository from users watchlist", async () => {
      const mockRepoId = 12345;
      const mockRepositoryDelete: GitRepository = {
        id: 1,
        repoId: mockRepoId,
        user: {
          id: 1,
          username: "Coco",
          password: "Coco123",
          email: "Coco@singimail.rs",
          role: UserRole.USER,
          repositories: [],
          deletedDate: undefined,
          deleted: false,
        },
        name: "",
        full_name: "",
        html_url: "",
        description: "",
        language: "",
        stargazers_count: 0,
        watchers_count: 0,
        forks_count: 0,
        releases: [],
      };
      mockRepository.findOne.mockResolvedValue(mockRepositoryDelete);

      await githubInteractionService.deleteRepository(mockRepoId);
      expect(mockRepository.remove).toHaveBeenCalled();
    });
    it("should throw an erroe if repository is not found", async () => {
      const mockRepoId = 123;
      mockRepository.findOne.mockResolvedValue(undefined);

      await expect(
        githubInteractionService.deleteRepository(mockRepoId)
      ).rejects.toThrowError(HttpException);
    });
  });

  describe("getWatchlist", () => {
    it("should return the watchlist", async () => {
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
        releases: [new Release()],
      };

      const mockUser = {
        id: 1,
        username: "Coco",
        password: "Coco123",
        email: "Coco@singimail.rs",
        roles: UserRole.USER,
        repositories: [mockedRepository],
      } as unknown as User;

      jest
        .spyOn(gitServ, "WatchlistQueryExample")
        .mockResolvedValue(mockUser.repositories);

      const result = await githubInteractionService.getWatchlist(mockUser);

      expect(gitServ.WatchlistQueryExample).toHaveBeenCalledWith(mockUser);

      expect(result).toEqual(mockUser.repositories);
    });
  });
});
