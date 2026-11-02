import { PickType } from "@nestjs/mapped-types";
import { UserDto } from "../../user/dto/user.dto.js";
import { IsEmail, IsString, MinLength } from "class-validator";
import { RegisterDto } from "./register.dto.js";

export class LoginDto extends PickType(RegisterDto, [
  "email",
  "password",
] as const) {}
