import { Test, TestingModule } from "@nestjs/testing";
import { User } from "../../users/domain/entity/user.entity";
import { UserRole } from "../../users/domain/enum/roles.enum";
import { GitHubScheduler } from "../domain/scheduler/github-scheduler";
import { of, throwError } from "rxjs";
import { GitRepository } from "../domain/entity/repository.entity";
import { Repository } from "typeorm";
import { SendingEmailService } from "../service/sending-email.service";
import { HttpService } from "@nestjs/axios";
import { getRepositoryToken } from "@nestjs/typeorm";
import { ConfigService } from "@nestjs/config";
import { Release } from "../domain/entity/release.entity";
import { scheduler } from "timers/promises";
import { GitrepositoryService } from "../service/gitrepository.service";
import { EmailData } from "../domain/interface/email.interface";

const mockHttpService = {
  get: jest.fn(),
  post: jest.fn(),
};

const mockConfigService = {
  get: jest.fn().mockReturnValue("mocked_github_token"),
};

const mockSendingEmail = {
  sendMonthSummary: jest.fn(),
  sendEmailWithBackoff: jest.fn(),
};

const mockUserRepository = {
  find: jest.fn(),
};

const mockGitRepository = {
  find: jest.fn(),
  save: jest.fn(),
};

const mockReleaseRepository = {
  create: jest.fn(),
  save: jest.fn(),
};

const mockGitServ = {
  checkForSameRepositories: jest.fn(),
  checkForReleaseStored: jest.fn(),
  checkForDefaultRelease: jest.fn(),
};

describe("GithubScheduler", () => {
  let githubScheduler: GitHubScheduler;
  let sendingEmailService: SendingEmailService;
  let httpService: HttpService;
  let userRepository: Repository<User>;
  let gitRepository: Repository<GitRepository>;
  let releaseRep: Repository<Release>;
  let gitServ: GitrepositoryService;

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
        {
          provide: getRepositoryToken(Release),
          useValue: mockReleaseRepository,
        },
        {
          provide: GitrepositoryService,
          useValue: mockGitServ,
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
    releaseRep = module.get<Repository<Release>>(getRepositoryToken(Release));
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
        repoId: 23,
        user: new User(),
        releases: [],
      };
      const mockResponse = { data: { name: "v2.1.23" } };
      const latestRelease =
        await githubScheduler.getLatestReliase(mockRepository);
      mockHttpService.get.mockReturnValue(of(mockResponse));

      expect(httpService.get).toHaveBeenCalledWith(
        "https://api.github.com/repos/alexander/mockingRepository/releases/latest",
        { headers: { Authorization: "token mocked_github_token" } }
      );
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
        repoId: 23,
        user: new User(),
        releases: [],
      };
      mockHttpService.get.mockReturnValue(
        throwError(() => new Error("Not Found"))
      );
      const consoleSpy = jest.spyOn(console, "log").mockImplementation();

      const latestRelease =
        await githubScheduler.getLatestReliase(mockRepository);

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining("latest reliase is not found")
      );
      expect(latestRelease).toBeUndefined();
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
      } as unknown as GitRepository;
      mockUser.repositories = [mockedRepository];

      const mockRelease = {
        release: "Hahaha",
        release_date: new Date(),
        repository: mockedRepository,
      } as Release;

      mockedRepository.releases = [mockRelease];

      jest
        .spyOn(gitRepository, "find")
        .mockResolvedValue(mockUser.repositories);
      jest
        .spyOn(githubScheduler, "getLatestReliase")
        .mockResolvedValue("v1.7.20");
      const createReleaseSpy = jest
        .spyOn(releaseRep, "create")
        .mockReturnValue(mockRelease);
      const saveReleaseSpy = jest
        .spyOn(gitRepository, "save")
        .mockResolvedValue(mockedRepository);

      jest.spyOn(githubScheduler, "sendNotification").mockImplementation();

      await githubScheduler.checkForUpdates();

      expect(gitRepository.find).toHaveBeenCalledWith({
        relations: ["user", "releases"],
      });
      expect(githubScheduler.getLatestReliase).toHaveBeenLastCalledWith(
        mockedRepository
      );
      expect(gitServ.checkForReleaseStored).toHaveBeenCalledWith(
        mockedRepository.releases,
        mockedRepository
      );
      expect(createReleaseSpy).toHaveBeenCalledWith(
        expect.objectContaining({ release: "v1.7.20" })
      );
      expect(saveReleaseSpy).toHaveBeenCalled();
      expect(githubScheduler.sendNotification).toHaveBeenCalledWith(
        mockedRepository
      );
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
        repoId: 23,
        user: mockUser,
        releases: [],
      };
      mockUser.repositories = [mockedRepository];

      jest
        .spyOn(gitRepository, "find")
        .mockResolvedValue(mockUser.repositories);
      jest
        .spyOn(githubScheduler, "getLatestReliase")
        .mockResolvedValue("v1.7.19");
      const saveSpy = jest.spyOn(gitRepository, "save");
      const sendingNotificationSpy = jest.spyOn(
        githubScheduler,
        "sendNotification"
      );

      await githubScheduler.checkForUpdates();

      expect(gitRepository.find).toHaveBeenCalledWith({
        relations: ["user"],
      });
      expect(githubScheduler.getLatestReliase).toHaveBeenCalledWith(
        mockedRepository
      );
      expect(saveSpy).not.toHaveBeenCalled();
      expect(sendingNotificationSpy).not.toHaveBeenCalled();
    });
  });

  describe("sendNotification", () => {
    it("should send Notification email if repository update", async () => {
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
        repoId: 23,
        user: mockUser,
        releases: [],
      };

      const emailData: EmailData = {
        from: "aleksandr.zolotarev@abstract.rs",
        to: mockedRepository.user.email,
        subject: "Here is update from your list!",
        text: "Hello, it is update mockingRepository from your Watchlist!!!",
      };

      jest
        .spyOn(sendingEmailService, "sendEmailWithBackoff")
        .mockResolvedValue(emailData);

      await githubScheduler.sendNotification(mockedRepository);

      expect(sendingEmailService.sendEmailWithBackoff).toHaveBeenCalledWith(
        emailData
      );
    });
  });

  describe("handleCron", () => {
    it("should call checkForUpdates when the cron is triggered", async () => {
      jest.spyOn(githubScheduler, "checkForUpdates").mockImplementation();

      await githubScheduler.handleCron();

      expect(githubScheduler.checkForUpdates).toHaveBeenCalled();
    });
  });

  describe("handleMonthSummary", () => {
    it("should send the monthly summary via SendingEmailService when cron is triggered", async () => {
      const mockRelease = {
        id: 1,
        release: "TypescriptRep",
        release_date: new Date(),
      } as unknown as Release;

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
        releases: [mockRelease],
        user: new User(),
      };

      const mockUser = {
        id: 1,
        username: "Coco",
        password: "Coco123",
        email: "Coco@singimail.rs",
        repositories: [mockedRepository],
      } as unknown as User;

      mockedRepository.user = mockUser;
      jest.spyOn(userRepository, "find").mockResolvedValue([mockUser]);

      await githubScheduler.handleMonthSummary();

      expect(userRepository.find).toHaveBeenCalledWith({
        relations: ["repositories", "repositories.releases"],
      });

      expect(sendingEmailService.sendMonthSummary).toHaveBeenCalledWith(
        mockUser
      );
    });
  });
});
