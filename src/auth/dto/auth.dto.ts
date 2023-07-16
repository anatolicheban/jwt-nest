import { IsEmail, IsString, Length } from "class-validator";

export class AuthDto {
  @IsEmail()
  email: string;
  @IsString()
  @Length(8, 16)
  password: string;
}
