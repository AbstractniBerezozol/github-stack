import { Body, Controller, Get, Post, Request, UseGuards } from '@nestjs/common'
import { AuthPayloadDto } from '../domain/dto/auth.dto'
import { AuthService } from '../service/auth.service'
import { JwtAuthGuard } from '../guards/jwt.guard'
import { ApiBearerAuth, ApiBody, ApiTags } from '@nestjs/swagger'
import { CreateUserDto } from '../../users/domain/dto/create-user.dto'

@ApiTags('auth')
@ApiBearerAuth()
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  @ApiBody({ type: AuthPayloadDto })
  async login(@Body() data: AuthPayloadDto) {
    return this.authService.login(data)
  }

  @Post('register')
  @ApiBody({ type: CreateUserDto })
  async register(@Body() data: CreateUserDto) {
    return this.authService.register(data)
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  getProfile(@Request() req) {
    const far = 'Hello'
    return req.user
  }

  @Post('refresh-token')
  async refreshToken(@Body('refreshToken') refreshToken: string) {
    return this.authService.refreshToken(refreshToken)
  }

  @Post('reset-password')
  async resetPassword(@Body('username') data: string) {
    return this.authService.resetPassword(data)
  }
}
