import { Body, Controller, Post } from "@nestjs/common";
import { AuthService } from "./auth.service.js";
import { UserDto } from "../user/dto/user.dto.js";
import { RegisterDto } from "../dto/register.dto.js";

@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("register")
  register(
    @Body() dto: RegisterDto,
  ): Promise<Omit<UserDto, "password" | "notes">> {
    return this.authService.register(dto);
  }
}
