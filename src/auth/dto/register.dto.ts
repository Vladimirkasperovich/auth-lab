import { PickType } from "@nestjs/mapped-types";
import { UserDto } from "../../user/dto/user.dto.js";
import { IsEmail, IsNotEmpty, IsString, MinLength } from "class-validator";

export class RegisterDto extends PickType(UserDto, [
  "email",
  "password",
  "name",
] as const) {
  @IsEmail({}, { message: "Введите корректный email" })
  declare email: string;

  @IsString({ message: "Пароль должен быть строкой" })
  @MinLength(8, {
    message: "Пароль должен содержать минимум 8 символов",
  })
  declare password: string;

  @IsString({ message: "Имя должно быть строкой" })
  @IsNotEmpty({ message: "Имя не может быть пустым" })
  declare name: string;
}
