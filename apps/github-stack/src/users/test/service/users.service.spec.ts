import { Test, TestingModule } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import { CreateUserDto } from "../../domain/dto/create-user.dto";
import { User } from "../../domain/entity/user.entity";
import { UsersService } from "../../service/users.service";

describe("UsersService", () => {
  let service: UsersService;

  const mockUserService = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    find: jest.fn(),
    preload: jest.fn(),
    delete: jest.fn(),
    remove: jest.fn(),
    softRemove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: getRepositoryToken(User), useValue: mockUserService },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });
  it("create => creates a new user and returns its data", async () => {
    const createUserDto = {
      username: "Coco",
      password: "Coco123",
      email: "Coco@singimail.rs",
    } as CreateUserDto;
    const user = {
      id: 1,
      username: "Coco",
      password: "Coco123",
      email: "Coco@singimail.rs",
      repositories: [],
    } as User;
    jest.spyOn(mockUserService, "create").mockReturnValue(user);
    jest.spyOn(mockUserService, "save").mockReturnValue(user);

    const result = await service.create(createUserDto);

    expect(mockUserService.save).toHaveBeenCalled();
    expect(mockUserService.save).toHaveBeenCalledWith(user);

    expect(result).toEqual(user);
  });
  it("findAll => finds all users by username and returns a list of its data", async () => {
    const user = {
      id: 1,
      username: "Coco",
      password: "Coco123",
      email: "Coco@singimail.rs",
      repositories: [],
    } as User;

    const users = [user];

    jest.spyOn(mockUserService, "find").mockReturnValue(users);

    const result = await service.findAll();
    expect(result).toEqual(users);
    expect(mockUserService.find).toHaveBeenCalled();
  });
  it("findOne => finds one user by username and returns its data", async () => {
    const user = {
      id: 1,
      username: "Coco",
      password: "Coco123",
      email: "Coco@singimail.rs",
      repositories: [],
    } as User;
    const username = "Coco";

    jest.spyOn(mockUserService, "findOne").mockReturnValue(user);

    const result = await service.findOne(username);
    expect(result).toEqual(user);

    expect(mockUserService.findOne).toBeCalled();
    expect(mockUserService.findOne).toBeCalledWith({ where: { username } });
  });

  it("update => changes the user and returns its data", async () => {
    const username = "Coco";
    const updateUserDto = {
      username: "Coco",
      password: "Coco12345",
      email: "Coco@singimail.rs",
    };
    const user = {
      id: 1,
      username: "Coco",
      password: "Coco123",
      email: "Coco@singimail.rs",
      repositories: [],
    } as User;

    jest.spyOn(mockUserService, "preload").mockReturnValue(user);

    const result = await service.update(updateUserDto);

    expect(result).toEqual({
      ...user,
      ...updateUserDto,
    });

    expect(mockUserService.findOne).toHaveBeenCalledWith({
      where: { username },
    });
    expect(mockUserService.save).toHaveBeenCalledWith({
      ...user,
      ...updateUserDto,
    });
  });

  it("remove => finds the user and delete it", async () => {
    const username = "Coco";
    const user = {
      id: 1,
      username: "Coco",
      password: "Coco123",
      email: "Coco@singimail.rs",
      repositories: [],
    } as User;

    jest.spyOn(mockUserService, "softRemove").mockReturnValue(user);

    const result = await service.remove(username);

    expect(result).toEqual("You are deleted!");

    expect(mockUserService.softRemove).toHaveBeenCalledWith({
      ...user,
      password: undefined,
    });
  });
});
