import { Test, TestingModule } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import { User } from "../../domain/entity/user.entity";
import { UsersService } from "../../service/users.service";
import { UpdateUserDto } from "../../domain/dto/update-user.dto";
import { NotFoundException } from "@nestjs/common";
import { Repository } from "typeorm";
import * as bcrypt from "bcryptjs";
import { CreateUserDto } from "../../domain/dto/create-user.dto";
import { UserRole } from "../../domain/enum/roles.enum";

describe("UsersService", () => {
  let userService: UsersService;
  let userRepository: Repository<User>;

  const mockUserRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    find: jest.fn(),
    softRemove: jest.fn(),
    update: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: getRepositoryToken(User), useValue: mockUserRepository },
      ],
    }).compile();

    userService = module.get<UsersService>(UsersService);
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
  });

  afterEach(() => {
    jest.clearAllMocks;
  });

  it("should be defined", () => {
    expect(userService).toBeDefined();
  });
  describe("create", () => {
    it("create => creates a new user and returns its data", async () => {
      const createUserDto: CreateUserDto = {
        username: "Coco",
        password: "Coco123",
        email: "Coco@singimail.rs",
        role: UserRole.USER,
      };

      const hashedPassword = "hashedPassword";

      const createdUser = {
        ...createUserDto,
        password: hashedPassword,
      } as User;

      jest.spyOn(bcrypt, "hash").mockResolvedValue(hashedPassword);
      jest.spyOn(userRepository, "create").mockReturnValue(createdUser);
      jest.spyOn(userRepository, "save").mockResolvedValue(createdUser);

      const result = await userService.create(createUserDto);

      expect(bcrypt.hash).toHaveBeenCalledWith(createUserDto.password, 10);
      expect(userRepository.create).toHaveBeenCalledWith({
        username: createUserDto.username,
        password: hashedPassword,
        email: createUserDto.email,
        role: createUserDto.role,
      });
      expect(userRepository.save).toHaveBeenCalledWith(createdUser);
      expect(result).toBe(createdUser);
    });
  });
  describe("findAll", () => {
    it("findAll => finds all users by username and returns a list of its data", async () => {
      const user = {
        id: 1,
        username: "Coco",
        password: "Coco123",
        email: "Coco@singimail.rs",
        repositories: [],
      } as User;

      const users = [user];

      jest.spyOn(userRepository, "find").mockResolvedValue(users);

      const result = await userService.findAll();

      expect(userRepository.find).toHaveBeenCalledWith({
        relations: { repositories: true },
      });
      expect(result).toEqual(users);
    });
  });
  describe("findOne", () => {
    it("findOne => finds one user by username and returns its data", async () => {
      const mockUser = {
        id: 1,
        username: "Coco",
        password: "Coco123",
        email: "Coco@singimail.rs",
        repositories: [],
      } as User;

      jest.spyOn(userRepository, "findOne").mockResolvedValue(mockUser);

      const result = await userService.findOne(mockUser.username);

      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { username: mockUser.username },
      });
      expect(result).toEqual(mockUser);
    });
  });

  describe("update", () => {
    it("update => changes the user and returns its data", async () => {
      const updateUserDto: UpdateUserDto = {
        password: "Coco12345",
      };
      const mockUser = {
        id: 1,
        username: "Coco",
        password: "Coco123",
        email: "Coco@singimail.rs",
        repositories: [],
      } as User;

      jest.spyOn(userRepository, "findOne").mockResolvedValue(mockUser);
      jest
        .spyOn(userRepository, "save")
        .mockResolvedValue({ ...mockUser, ...updateUserDto });

      const result = await userService.update(mockUser.username, updateUserDto);

      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { username: mockUser.username },
      });
      expect(userRepository.save).toHaveBeenCalledWith({
        ...mockUser,
        ...updateUserDto,
      });
      expect(result).toEqual({ ...mockUser, ...updateUserDto });
    });

    it("should throw and exception if user is not found", async () => {
      jest.spyOn(userRepository, "findOne").mockResolvedValue(null);

      await expect(
        userService.update("mommy", {} as UpdateUserDto)
      ).rejects.toThrow(new NotFoundException("User not found"));
    });
  });
  describe("remove", () => {
    it("remove => finds the user and delete it", async () => {
      const mockUser = {
        id: 1,
        username: "Coco",
        password: "Coco123",
        email: "Coco@singimail.rs",
        repositories: [],
      } as User;

      jest.spyOn(userService, "findOne").mockResolvedValue(mockUser);
      jest.spyOn(userRepository, "softRemove").mockResolvedValue(mockUser);

      const result = await userService.remove(mockUser.username);

      expect(userService.findOne).toHaveBeenCalledWith(mockUser.username);
      expect(userRepository.softRemove).toHaveBeenCalledWith(mockUser);
    });
  });
});
