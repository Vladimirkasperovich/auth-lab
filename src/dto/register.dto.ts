import { PickType } from "@nestjs/mapped-types";
import { UserDto } from "../user/dto/user.dto.js";

export class RegisterDto extends PickType(UserDto, [
  "email",
  "password",
  "name",
] as const) {}
