import { Test, TestingModule } from "@nestjs/testing";
import { SendingEmailService } from "../service/sending-email.service";
import { User } from "../../users/domain/entity/user.entity";
import { GitRepository } from "../domain/entity/repository.entity";
import { HttpService } from "@nestjs/axios";
import { Repository } from "typeorm";
import { UserRole } from "../../users/domain/enum/roles.enum";
import { getRepositoryToken } from "@nestjs/typeorm";
import { EmailData } from "../domain/interface/email.interface";
import { of } from "rxjs";
import { AxiosResponse } from "axios";
import { Release } from "../domain/entity/release.entity";

const mockHttpService = {
  get: jest.fn(),
  post: jest.fn(),
};

const mockUserRepository = {
  find: jest.fn(),
};

describe("SendingEmailService", () => {
  let httpService: HttpService;
  let sendingEmailService: SendingEmailService;
  let userRepostory: Repository<User>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SendingEmailService,
        { provide: HttpService, useValue: mockHttpService },
        { provide: getRepositoryToken(User), useValue: mockUserRepository },
      ],
    }).compile();

    sendingEmailService = module.get<SendingEmailService>(SendingEmailService);
    httpService = module.get<HttpService>(HttpService);
    userRepostory = module.get<Repository<User>>(getRepositoryToken(User));
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

      const result = await sendingEmailService.sendingEmail(emailData);

      expect(httpService.post).toHaveBeenCalledWith(
        "http://localhost:3001/sendingTestingEmail/messageRequest",
        emailData
      );
      expect(result).toBe("Email sent succesfully");
    });
  });
  describe("sendMonthSummary", () => {
    it("should send monthly summary to users", async () => {
      const sendEmailSpy = jest
        .spyOn(sendingEmailService, "sendEmailWithBackoff")
        .mockRejectedValueOnce(undefined);

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
        release: [new Release()],
      };

      const mockUser = {
        id: 1,
        username: "Coco",
        password: "Coco123",
        email: "Coco@singimail.rs",
        roles: UserRole.USER,
        repositories: [mockedRepository],
      } as unknown as User;

      const release = {
        id: 1,
        release: "HAHAH",
        repository: mockedRepository,
        release_date: new Date(),
      } as Release;

      // const mockResponse = { data: "Email sent" };

      // mockHttpService.post.mockReturnValue(of(mockResponse));
      // const spySendingEmail = jest
      //   .spyOn(sendingEmailService, "sendingEmail")
      //   .mockResolvedValue("Email sent");

      await sendingEmailService.sendMonthSummary(mockUser);

      // const mockLetter = {
      //   from: "aleksandr.zolotarev@abstract.rs",
      //   to: mockUser.email,
      //   subject: "Here is your month summary",
      //   text: `Hello, please, here is your monthly summary activity:\n\n- ${mockedRepository.name}`,
      // };

      expect(sendEmailSpy).toHaveBeenCalledWith({
        from: "aleksandr.zolotarev@abstract.rs",
        to: mockUser.email,
        subject: "Here is your month summary",
        text: expect.stringContaining(
          `Hello, please, here is your monthly summary activity:\n\n- ${mockedRepository.name}`
        ).stringContaining("HAHAH"),
      });
    });
  });
  describe("sendNewPassword", () => {
    it("should send a new password email", async () => {
      const email = "abracadabra@mail.com";
      const password = "qwerty123";

      const sendEmailSpy = jest
        .spyOn(sendingEmailService, "sendingEmail")
        .mockResolvedValue("Email sent succesfully");

      await sendingEmailService.sendNewPassword(email, password);

      expect(sendEmailSpy).toHaveBeenCalledWith({
        from: "aleksandr.zolotarev@abstract.rs",
        to: email,
        subject: "New Password",
        text: `Greetings! Here is your new password: ${password}`,
      });
    });
  });
});
