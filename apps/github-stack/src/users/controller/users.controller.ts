import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
} from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { UsersService } from "../service/users.service";
import { UpdateUserDto } from "../domain/dto/update-user.dto";
import { Roles } from "../../auth/domain/decorator/roles.decorator";
import { JwtAuthGuard } from "../../auth/guards/jwt.guard";
import { UserRole } from "../domain/enum/roles.enum";
import { CreateUserDto } from "../domain/dto/create-user.dto";

@UseGuards(JwtAuthGuard)
@ApiTags("users")
@Controller("users")
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @Get(":username")
  findOne(@Param("username") username: string) {
    return this.usersService.userWithNoPassword(username);
  }

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Patch(":username")
  update(@Request() req, @Body() updateUserDto: UpdateUserDto) {
    const username = req.user.username;
    return this.usersService.update(username, updateUserDto);
  }

  @Roles(UserRole.ADMIN)
  @Delete(":username")
  remove(@Param("username") username: string) {
    return this.usersService.remove(username);
  }
}
