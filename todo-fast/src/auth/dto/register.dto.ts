import { IsEmail, IsNotEmpty, IsOptional, MinLength } from "class-validator";
import { Role } from "../enums/role.enum";

export class RegisterDto {
  @IsNotEmpty()
  name: string;

  @IsEmail()
  email: string;

  @MinLength(6)
  password: string;
  
  @IsOptional()
  role:Role
}
