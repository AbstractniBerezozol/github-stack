import { IsEmail, IsEnum, IsOptional, IsString } from "@nestjs/class-validator";
import { ApiProperty } from "@nestjs/swagger";
import { UserRole } from "../enum/roles.enum";

export class CreateUserDto {
  @ApiProperty()
  @IsString()
  username: string;
  @IsString()
  password: string;
  @IsEmail()
  email: string;
  @IsEnum(UserRole)
  role: UserRole;
}
