import { Test, TestingModule } from "@nestjs/testing";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcryptjs";
import { UnauthorizedException } from "@nestjs/common";
import { User } from "../../users/domain/entity/user.entity";
import { UsersService } from "../../users/service/users.service";
import { AuthService } from "../service/auth.service";
import { CreateUserDto } from "../../users/domain/dto/create-user.dto";
import { UserRole } from "../../users/domain/enum/roles.enum";
import { SendingEmailService } from "../../github-ineraction/service/sending-email.service";
import { verify } from "crypto";
import { access } from "fs";
import { UpdateUserDto } from "../../users/domain/dto/update-user.dto";

const mockUserService = {
  findOne: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  save: jest.fn(),
};
const mockJwtService = {
  sign: jest.fn().mockReturnValue("mockAccessToken"),
  verify: jest.fn(),
};
const mockSendingEmailService = {
  sendNewPassword: jest.fn(),
};
describe("AuthService", () => {
  let authService: AuthService;
  let usersService: UsersService;
  let jwtService: JwtService;
  let sendingEmailService: SendingEmailService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        { provide: UsersService, useValue: mockUserService },
        { provide: JwtService, useValue: mockJwtService },
        { provide: SendingEmailService, useValue: mockSendingEmailService },
        AuthService,
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    usersService = module.get<UsersService>(UsersService);
    jwtService = module.get<JwtService>(JwtService);
    sendingEmailService = module.get<SendingEmailService>(SendingEmailService);
  });

  it("should be defined", () => {
    expect(authService).toBeDefined();
  });

  describe("login", () => {
    it("should throw an exception if user is not found", async () => {
      mockUserService.findOne.mockResolvedValue(null);
      await expect(
        authService.login({ username: "Coco", password: "Coco123" })
      ).rejects.toThrow(UnauthorizedException);
    });

    it("should throw an exception if password is wrong", async () => {
      const user = { username: "Coco", password: "Coco123" };
      mockUserService.findOne.mockResolvedValue(user);
      jest.spyOn(bcrypt, "compare").mockReturnValueOnce(false);
      await expect(
        authService.login({ username: "Coco", password: "garantija" })
      ).rejects.toThrow(UnauthorizedException);
    });

    it(" should return jwt token for logging", async () => {
      const user = {
        id: 1,
        username: "Coco",
        password: "Coco123",
        repositories: [],
      } as User;
      mockUserService.findOne.mockResolvedValue(user);
      jest.spyOn(bcrypt, "compare").mockReturnValueOnce(true);

      const result = await authService.login({
        username: "Coco",
        password: "Coco123",
      });
      expect(result).toHaveProperty("access_token");
      const { password: password2, ...res } = user;
      expect(jwtService.sign).toHaveBeenCalledWith(res);
    });
  });

  describe("register", () => {
    it("should register a new user", async () => {
      const createUserDto: CreateUserDto = {
        username: "Coco",
        password: "Coco123",
        email: "Coco@gmail.com",
        role: UserRole.USER,
      };
      const expectedUser = { ...createUserDto, id: 2 };
      mockUserService.create.mockResolvedValue(expectedUser);

      const result = await authService.register(createUserDto);

      expect(result).toEqual(expectedUser);
      expect(mockUserService.create).toHaveBeenCalledWith(createUserDto);
    });
  });

  describe("generateRefreshToken", () => {
    it("should generate refresh Token", async () => {
      const refreshToken = await authService.generateRefreshToken("testUser");
      expect(jwtService.sign).toHaveBeenCalledWith(
        { sub: "testUser" },
        { secret: process.env.JWT_SECRET, expiresIn: "1h" }
      );
      expect(refreshToken).toBe("mockAccessToken");
    });
  });

  describe("refreshToken", () => {
    it("should new access and new generate tokens", async () => {
      const mockUser = {
        id: 1,
        username: "Coco",
        password: "Coco123",
        repositories: [],
        role: UserRole.USER,
      } as User;

      jest
        .spyOn(jwtService, "verify")
        .mockReturnValue({ username: mockUser.username });
      jest.spyOn(usersService, "findOne").mockResolvedValue(mockUser);
      jest
        .spyOn(authService, "generateRefreshToken")
        .mockResolvedValue("new_refresh_token");
      jest.spyOn(jwtService, "sign").mockReturnValue("new_access_token");

      const result = await authService.refreshToken("valid_refresh_token");

      expect(jwtService.verify).toHaveBeenCalledWith("valid_refresh_token", {
        secret: process.env.JWT_SECRET,
      });
      expect(usersService.findOne).toHaveBeenCalledWith(mockUser.username);
      expect(authService.generateRefreshToken).toHaveBeenCalledWith(
        mockUser.username
      );
      expect(result).toEqual({
        accessToken: "new_access_token",
        refreshToken: "new_refresh_token",
      });
    });
  });

  describe("resetPassword", () => {
    it("should reset user password and send email with it", async () => {
      const mockUser = {
        id: 1,
        username: "Coco",
        password: "Coco123",
        repositories: [],
        role: UserRole.USER,
      } as User;

      const mockNewPassword = "qwerty123";
      const mockHashedPassword = "hashedNewPassword";

      jest.spyOn(usersService, "findOne").mockResolvedValue(mockUser);
      jest
        .spyOn(authService, "generateRandomPassword")
        .mockReturnValue(mockNewPassword);
      jest.spyOn(bcrypt, "hash").mockResolvedValue(mockHashedPassword);
      jest.spyOn(usersService, "update").mockResolvedValue(mockUser);
      jest.spyOn(sendingEmailService, "sendNewPassword").mockResolvedValue();

      await authService.resetPassword("test");

      expect(usersService.findOne).toHaveBeenCalledWith("test");
      expect(authService.generateRandomPassword).toHaveBeenCalled();
      expect(bcrypt.hash).toHaveBeenCalledWith(mockNewPassword, 10);
      expect(usersService.update).toHaveBeenCalledWith({
        password: mockHashedPassword,
      });
      expect(sendingEmailService.sendNewPassword).toHaveBeenCalledWith(
        mockUser.email,
        mockNewPassword
      );
    });
  });

  describe("generateRandomPasswords", () => {
    it("should generate a random password", () => {
      const password = authService.generateRandomPassword();
      expect(password).toHaveLength(12);
      expect(password).toMatch(/^[A-Za-z0-9]{12}$/);
    });
  });
});
