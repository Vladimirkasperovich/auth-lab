import { Controller, Get, Req, UseGuards } from "@nestjs/common";
import { UserService } from "./user.service.js";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard.js";
import { UserDto } from "./dto/user.dto.js";
import type { Request } from "express";

type AuthenticatedRequest = Request & {
  user: {
    id: string;
  };
};

@Controller("users")
export class UserController {
  constructor(private readonly userService: UserService) {}

  @UseGuards(JwtAuthGuard)
  @Get("me")
  findById(
    @Req() request: AuthenticatedRequest,
  ): Promise<Omit<UserDto, "password" | "notes">> {
    return this.userService.getById(request.user.id);
  }
}
