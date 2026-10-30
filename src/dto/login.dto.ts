import { PickType } from "@nestjs/mapped-types";
import { UserDto } from "../user/dto/user.dto.js";

export class LoginDto extends PickType(UserDto, [
  "email",
  "password",
] as const) {}
