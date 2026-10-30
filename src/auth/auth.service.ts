import { ConflictException, Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service.js";
import { UserDto } from "../user/dto/user.dto.js";
import { hash } from "argon2";
import { RegisterDto } from "../dto/register.dto.js";
import { LoginDto } from "../dto/login.dto.js";

@Injectable()
export class AuthService {
  constructor(private readonly prismaService: PrismaService) {}

  async register(
    dto: RegisterDto,
  ): Promise<Omit<UserDto, "password" | "notes">> {
    const { email, password, name } = dto;
    const userExist = await this.prismaService.user.findUnique({
      where: { email },
    });

    if (userExist) {
      throw new ConflictException(
        `Пользователь с таким ${email} email уже существует`,
      );
    }

    const passwordHash = await hash(password);

    return this.prismaService.user.create({
      data: { email, name, password: passwordHash },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async login(dto: LoginDto) {
    dto.email;
  }
}
