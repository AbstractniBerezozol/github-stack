import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { UsersService } from '../service/users.service'
import { UpdateUserDto } from '../domain/dto/update-user.dto'
import { Roles } from '../../auth/domain/decorator/roles.decorator'
import { JwtAuthGuard } from '../../auth/guards/jwt.guard'
import { UserRole } from '../domain/enum/roles.enum'
import { CreateUserDto } from '../domain/dto/create-user.dto'

@UseGuards(JwtAuthGuard)
@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto)
  }

  @Get()
  findAll() {
    return this.usersService.findAll()
  }

  @Get(':username')
  findOne(@Param('username') username: string) {
    return this.usersService.userWithNoPassword(username)
  }

  @Patch(':username')
  update(@Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(updateUserDto)
  }

  @Roles([UserRole.ADMIN])
  @Delete(':username')
  remove(@Param('username') username: string) {
    return this.usersService.remove(username)
  }
}
