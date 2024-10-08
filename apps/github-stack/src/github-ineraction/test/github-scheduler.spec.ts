import { Test, TestingModule } from "@nestjs/testing";
import { User } from "../../users/domain/entity/user.entity";
import { UserRole } from "../../users/domain/enum/roles.enum";
import { GitHubScheduler } from "../domain/scheduler/github-scheduler";
import { of } from "rxjs";
import { GitRepository } from "../domain/entity/repository.entity";
import { Repository } from "typeorm";
import { SendingEmailService } from "../service/sending-email.service";
import { HttpService } from "@nestjs/axios";
import { getRepositoryToken } from "@nestjs/typeorm";
import { ConfigService } from "@nestjs/config";

const mockHttpService = {
  get: jest.fn(),
  post: jest.fn(),
};

const mockConfigService = {
  get: jest.fn().mockReturnValue("mocked_github_token"),
};

const mockSendingEmail = {
  sendMonthSummary: jest.fn(),
  sendingEmail: jest.fn(),
};

const mockUserRepository = {
  find: jest.fn(),
};

const mockGitRepository = {
  find: jest.fn(),
  save: jest.fn(),
};

describe("GithubScheduler", () => {
  let githubScheduler: GitHubScheduler;
  let sendingEmailService: SendingEmailService;
  let httpService: HttpService;
  let userRepository: Repository<User>;
  let gitRepository: Repository<GitRepository>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GitHubScheduler,
        { provide: HttpService, useValue: mockHttpService },
        { provide: SendingEmailService, useValue: mockSendingEmail },
        { provide: ConfigService, useValue: mockConfigService },
        { provide: getRepositoryToken(User), useValue: mockUserRepository },
        {
          provide: getRepositoryToken(GitRepository),
          useValue: mockGitRepository,
        },
      ],
    }).compile();

    githubScheduler = module.get<GitHubScheduler>(GitHubScheduler);
    httpService = module.get<HttpService>(HttpService);
    sendingEmailService = module.get<SendingEmailService>(SendingEmailService);
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
    gitRepository = module.get<Repository<GitRepository>>(
      getRepositoryToken(GitRepository)
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("getLatestReliase", () => {
    it("should find latest reliase from repository", async () => {
      const mockRepository: GitRepository = {
        id: 1,
        name: "mockingRepository",
        full_name: "alexander/mockingRepository",
        html_url: "https://github.com/alexander/mockingRepository",
        description: "Here is test repository for something incredible",
        language: "TypeScript",
        stargazers_count: 103,
        watchers_count: 6,
        forks_count: 10509,
        latestRelease: "v1.7.19",
        repoId: 23,
        user: new User(),
      };
      const mockResponse = { data: { name: "v2.1.23" } };
      mockHttpService.get.mockReturnValue(of(mockResponse));

      const result = await githubScheduler.getLatestReliase(mockRepository);
      expect(result).toEqual("v2.1.23");
    });

    it("should handle errors during getting the last reliase", async () => {
      const mockRepository: GitRepository = {
        id: 1,
        name: "mockingRepository",
        full_name: "alexander/mockingRepository",
        html_url: "https://github.com/alexander/mockingRepository",
        description: "Here is test repository for something incredible",
        language: "TypeScript",
        stargazers_count: 103,
        watchers_count: 6,
        forks_count: 10509,
        latestRelease: "v1.7.19",
        repoId: 23,
        user: new User(),
      };
      mockHttpService.get.mockReturnValue({
        toPromise: () => Promise.reject("API ERROR"),
      });

      const result = await githubScheduler.getLatestReliase(mockRepository);
      expect(result).toBeUndefined();
    });
  });

  describe("checkForUpdates", () => {
    it("should notify if updates were found", async () => {
      const mockUser = {
        id: 1,
        username: "Coco",
        password: "Coco123",
        email: "Coco@singimail.rs",
        roles: UserRole.USER,
        repositories: [],
      } as unknown as User;
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
        latestRelease: "v1.7.19",
        repoId: 23,
        user: mockUser,
      } as GitRepository;
      mockUser.repositories = [mockedRepository];

      jest.spyOn(gitRepository, "find").mockResolvedValue([mockedRepository]);
      jest
        .spyOn(githubScheduler, "getLatestReliase")
        .mockResolvedValue("v1.7.20");
      const saveSpy = jest
        .spyOn(gitRepository, "save")
        .mockResolvedValue(mockedRepository);

      const sendEmailSpy = jest
        .spyOn(sendingEmailService, "sendingEmail")
        .mockResolvedValue("OK");

      await githubScheduler.checkForUpdates();

      expect(gitRepository.find).toHaveBeenCalledWith({
        relations: ["user"],
      });
      expect(githubScheduler.getLatestReliase).toHaveBeenLastCalledWith(
        mockedRepository
      );
      expect(saveSpy).toHaveBeenCalledWith({
        ...mockedRepository,
        latestRelease: "v1.7.20",
      });
      expect(sendEmailSpy).toHaveBeenCalledWith({
        from: "aleksandr.zolotarev@abstract.rs",
        to: mockUser.email,
        subject: "Here is update from your list!",
        text: `Hello, it is update ${mockedRepository.name} from your Watchlist!!!`,
      });
    });

    it("should not notify if updates were not found", async () => {
      const mockUser = {
        id: 1,
        username: "Coco",
        password: "Coco123",
        email: "Coco@singimail.rs",
        roles: ["default"],
        repositories: [],
      } as unknown as User;
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
        latestRelease: "v1.7.19",
        repoId: 23,
        user: mockUser,
      };
      mockUser.repositories = [mockedRepository];

      jest.spyOn(gitRepository, "find").mockResolvedValue([mockedRepository]);
      jest
        .spyOn(githubScheduler, "getLatestReliase")
        .mockResolvedValue("v1.7.19");
      const saveSpy = jest
        .spyOn(gitRepository, "save")
        .mockResolvedValue(mockedRepository);

      const sendEmailSpy = jest
        .spyOn(sendingEmailService, "sendingEmail")
        .mockResolvedValue("OK");

      await githubScheduler.checkForUpdates();

      expect(gitRepository.find).toHaveBeenCalledWith({
        relations: ["user"],
      });
      expect(githubScheduler.getLatestReliase).toHaveBeenCalledWith(
        mockedRepository
      );
      expect(saveSpy).not.toHaveBeenCalled();
      expect(sendEmailSpy).not.toHaveBeenCalled();
    });
  });

  describe("handleCron", () => {
    it("should call checkForUpdates when the cron is triggered", async () => {
      const checkForUpdatesSpy = jest
        .spyOn(githubScheduler, "checkForUpdates")
        .mockResolvedValue();

      await githubScheduler.handleCron();

      expect(checkForUpdatesSpy).toHaveBeenCalled();
    });
  });

  describe("handleMonthSummary", () => {
    it("should send the monthly summary via SendingEmailService when cron is triggered", async () => {
      const mockUser = {
        id: 1,
        username: "Coco",
        password: "Coco123",
        email: "Coco@singimail.rs",
        roles: ["default"],
        repositories: [],
      } as unknown as User;
      jest.spyOn(userRepository, "find").mockResolvedValue([mockUser]);

      await githubScheduler.handleMonthSummary();

      expect(userRepository.find).toHaveBeenCalledWith({
        relations: ["repositories"],
      });

      expect(sendingEmailService.sendMonthSummary).toHaveBeenCalledWith(
        mockUser
      );
    });
  });
});
