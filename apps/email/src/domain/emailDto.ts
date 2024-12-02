import { IsEmail, IsString } from '@nestjs/class-validator';

export class EmailDto {
  @IsString()
  from: string;
  @IsEmail()
  to: string;
  @IsString()
  subject: string;
  @IsString()
  text: string;
}
