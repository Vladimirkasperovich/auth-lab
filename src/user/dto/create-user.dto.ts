import { PickType } from "@nestjs/mapped-types";
import { UserDto } from "./user.dto.js";

export class CreateUserDto extends PickType(UserDto, [
  "email",
  "password",
  "name",
] as const) {}
