import { Test, TestingModule } from "@nestjs/testing";
import { SendingEmailService } from "../service/sending-email.service";
import { User } from "../../users/domain/entity/user.entity";
import { HttpService } from "@nestjs/axios";
import { Repository } from "typeorm";
import { getRepositoryToken } from "@nestjs/typeorm";
import { EmailData } from "../domain/interface/email.interface";
import { of, throwError } from "rxjs";
import { GitRepository } from "../domain/entity/repository.entity";
import { Logger } from "@nestjs/common";
import { Release } from "../domain/entity/release.entity";
import { send } from "process";

const mockHttpService = {
  get: jest.fn(),
  post: jest.fn(),
};

const mockUserRepository = {
  find: jest.fn(),
};

const mockGitRepository = {
  find: jest.fn(),
};

const mockServer = {
  emit: jest.fn(),
};

const mockReleaseRepository = {
  create: jest.fn(),
  save: jest.fn(),
};

const loggerJest = {
  log: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};
describe("SendingEmailService", () => {
  let httpService: HttpService;
  let sendingEmailService: SendingEmailService;
  let userRep: Repository<User>;
  let gitRep: Repository<GitRepository>;
  let releaseRep: Repository<Release>;
  let server: { emit: jest.Mock };
  let logger: Logger;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SendingEmailService,
        { provide: HttpService, useValue: mockHttpService },
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
          provide: Logger,
          useValue: loggerJest,
        },
      ],
    }).compile();

    sendingEmailService = module.get<SendingEmailService>(SendingEmailService);
    httpService = module.get<HttpService>(HttpService);
    (logger = module.get<Logger>(Logger)),
      (userRep = module.get<Repository<User>>(getRepositoryToken(User)));
    releaseRep = module.get<Repository<Release>>(getRepositoryToken(Release));
    gitRep = module.get<Repository<GitRepository>>(
      getRepositoryToken(GitRepository)
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should be defined", () => {
    expect(sendingEmailService).toBeDefined();
  });
  describe("sendingEmail", () => {
    it("should send an email; and return some response", async () => {
      const emailData: EmailData = {
        from: "aleksandr.zolotarev@abstract.rs",
        to: "user.email",
        subject: "subject",
        text: "text",
      };

      const mockResponse = {
        data: "Email sent succesfully",
      };

      mockHttpService.post.mockReturnValue(of(mockResponse));

      const result = await sendingEmailService.sendEmail(emailData);

      expect(httpService.post).toHaveBeenCalledWith(
        "http://localhost:3001/sendingTestingEmail/messageRequest",
        emailData
      );
      expect(result).toBe("Email sent succesfully");
    });

    it("should throw an error if something goes wrong", async () => {
      const emailData: EmailData = {
        from: "aleksandr.zolotarev@abstract.rs",
        to: "user.email",
        subject: "subject",
        text: "text",
      };

      mockHttpService.post.mockReturnValue(
        throwError(() => new Error("Failed to send Email"))
      );

      await expect(sendingEmailService.sendEmail(emailData)).rejects.toThrow(
        "Failed to send Email"
      );
    });
  });

  describe("sendEmailWithBackoff", () => {
    it("should emit email data to gateway", async () => {
      const emailData: EmailData = {
        from: "aleksandr.zolotarev@abstract.rs",
        to: "user.email",
        subject: "subject",
        text: "text",
      };

      mockServer.emit.mockImplementation(() => true);

      await sendingEmailService.sendEmailWithBackoff(emailData);

      expect(mockServer.emit).toHaveBeenCalledWith("sendMessage", emailData);
      expect(logger.log).toHaveBeenCalledWith("Email sent");
    });
  });
  describe("sendMonthSummary", () => {
    it("should send monthly summary to users", async () => {
      const emailData: EmailData = {
        from: "aleksandr.zolotarev@abstract.rs",
        to: "user.email",
        subject: "subject",
        text: "text",
      };

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

      jest
        .spyOn(sendingEmailService, "sendEmailWithBackoff")
        .mockResolvedValue(emailData);

      await sendingEmailService.sendEmailWithBackoff(emailData);

      expect(sendingEmailService.sendEmailWithBackoff).toHaveBeenCalledWith(
        emailData
      );
    });
  });

  describe("sendNewPassword", () => {
    it("should send a new password email", async () => {
      const email = "abracadabra@mail.com";
      const password = "qwerty123";

      const emailData = {
        from: "aleksandr.zolotarev@abstract.rs",
        to: email,
        subject: "New Password",
        text: `Greetings! Here is your new password: ${password}`,
      };

      jest
        .spyOn(sendingEmailService, "sendNewPassword")
        .mockResolvedValue(emailData as any);
      await sendingEmailService.sendNewPassword(email, password);

      expect(sendingEmailService.sendEmailWithBackoff).toHaveBeenCalledWith(
        emailData
      );
    });
  });
});
