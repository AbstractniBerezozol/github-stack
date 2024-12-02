import {
  Injectable,
  NotFoundException
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import * as bcrypt from "bcryptjs";
import { Repository } from "typeorm";
import { CreateUserDto } from "../domain/dto/create-user.dto";
import { UpdateUserDto } from "../domain/dto/update-user.dto";
import { User } from "../domain/entity/user.entity";
import { UserRole } from "../domain/enum/roles.enum";

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>
  ) {}

  async findAll() {
    const users = await this.userRepository.find({
      relations: { repositories: true },
    });
    for (const user of users) {
      delete user.password;
    }
    return users;
  }

  async findOne(username: string) {
    if (!username) {
      throw new Error("Username is null");
    }

    const user = await this.userRepository.findOne({
      where: { username },
    });
    if (!user) {
      throw new NotFoundException(`User #${username} not found`);
    }
    return user;
  }

  async findOneUserWithRepos(username: string) {
    const user = await this.userRepository.findOne({
      where: { username },
      relations: { repositories: true },
    });
    if (!user) {
      throw new NotFoundException();
    }
    return user;
  }

  async userWithNoPassword(username: string) {
    const user = this.findOneUserWithRepos(username);
    delete (await user).password;
    return user;
  }
  async create(createUserDto: CreateUserDto) {
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
    const username = createUserDto.username;
    const email = createUserDto.email;
    const role = createUserDto.role;
    const newUser = this.userRepository.create({
      username,
      email,
      password: hashedPassword,
      role: role || UserRole.USER,
    });
    return this.userRepository.save(newUser);
  }
  async update(username: string, updateUserDto: UpdateUserDto) {
    const user = await this.userRepository.findOne({ where: { username } });
    if (!user) {
      throw new NotFoundException(`User not found`);
    }
    const updatedUser = {
      ...user,
      ...updateUserDto,
    };
    await this.userRepository.save(updatedUser);
    return updatedUser;
  }

  async remove(username: string) {
    const user = await this.findOne(username);
    delete user.password;
    this.userRepository.softRemove(user);
  }
}
