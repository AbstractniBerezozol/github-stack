import { IsEmail, IsOptional, IsString } from '@nestjs/class-validator'
import { ApiProperty } from '@nestjs/swagger'

export class CreateUserDto {
  @ApiProperty()
  @IsString()
  username: string
  @IsString()
  password: string
  @IsEmail()
  email: string
  roles: string[]
}
