import { IsNotEmpty, IsString, Length } from '@nestjs/class-validator'
import { ApiProperty } from '@nestjs/swagger'

export class AuthPayloadDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  username: string
  @IsNotEmpty()
  @IsString()
  @Length(7, 50)
  password: string
}
