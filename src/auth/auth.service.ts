import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service.js";
import { UserDto } from "../user/dto/user.dto.js";
import { hash, verify } from "argon2";
import { RegisterDto } from "./dto/register.dto.js";
import { LoginDto } from "./dto/login.dto.js";
import { JwtService } from "@nestjs/jwt";
import { randomUUID } from "crypto";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class AuthService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

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

  async login(
    dto: LoginDto,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const { password, email } = dto;

    const user = await this.prismaService.user.findUnique({ where: { email } });

    if (!user || !(await verify(user.password, password))) {
      throw new UnauthorizedException("Неверный email или пароль");
    }

    const sessionId = randomUUID();
    const refreshToken = await this.generateRefreshToken(user.id, sessionId);
    const refreshTokenHash = await hash(refreshToken);

    await this.prismaService.session.create({
      data: {
        id: sessionId,
        userId: user.id,
        refreshTokenHash,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    const accessToken = await this.jwtService.signAsync({
      sub: user.id,
    });

    return { accessToken, refreshToken };
  }
  async refresh(refreshToken: string) {
    if (!refreshToken) {
      throw new UnauthorizedException("Refresh-токен отсутствует");
    }

    let payload: { sub: string; sid: string };

    try {
      payload = await this.jwtService.verifyAsync<{
        sub: string;
        sid: string;
      }>(refreshToken, {
        secret: this.configService.getOrThrow<string>("JWT_REFRESH_SECRET"),
      });
    } catch {
      throw new UnauthorizedException("Недействительный refresh-токен");
    }
    if (typeof payload.sub !== "string" || typeof payload.sid !== "string") {
      throw new UnauthorizedException("Некорректный refresh-токен");
    }
    const session = await this.prismaService.session.findUnique({
      where: { id: payload.sid },
    });

    if (
      !session ||
      session.userId !== payload.sub ||
      session.expiresAt <= new Date()
    ) {
      throw new UnauthorizedException("Сессия недействительна");
    }

    const isValid = await verify(session.refreshTokenHash, refreshToken);

    if (!isValid) {
      throw new UnauthorizedException("Refresh-токен отозван");
    }

    const newRefreshToken = await this.generateRefreshToken(
      payload.sub,
      session.id,
    );

    const newRefreshTokenHash = await hash(newRefreshToken);

    const result = await this.prismaService.session.updateMany({
      where: {
        id: session.id,
        refreshTokenHash: session.refreshTokenHash,
        expiresAt: { gt: new Date() },
      },
      data: {
        refreshTokenHash: newRefreshTokenHash,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    if (result.count !== 1) {
      throw new UnauthorizedException(
        "Сессия уже была обновлена или недействительна",
      );
    }

    const accessToken = await this.jwtService.signAsync({ sub: payload.sub });

    return { accessToken, refreshToken: newRefreshToken };
  }

  async logout(refreshToken: string): Promise<void> {
    if (!refreshToken) {
      throw new UnauthorizedException("Refresh-токен отсутствует");
    }

    let payload: { sub: string; sid: string };

    try {
      payload = await this.jwtService.verifyAsync<{
        sub: string;
        sid: string;
      }>(refreshToken, {
        secret: this.configService.getOrThrow<string>("JWT_REFRESH_SECRET"),
      });
    } catch {
      throw new UnauthorizedException("Недействительный refresh-токен");
    }

    if (typeof payload.sub !== "string" || typeof payload.sid !== "string") {
      throw new UnauthorizedException("Некорректный refresh-токен");
    }
    const session = await this.prismaService.session.findUnique({
      where: { id: payload.sid },
    });

    if (!session || session.userId !== payload.sub) {
      throw new UnauthorizedException("Сессия не найдена");
    }

    const isValid = await verify(session.refreshTokenHash, refreshToken);

    if (!isValid) {
      throw new UnauthorizedException("Refresh-токен отозван");
    }

    await this.prismaService.session.delete({
      where: { id: session.id },
    });
  }
  private async generateRefreshToken(userId: string, sessionId: string) {
    return this.jwtService.signAsync(
      {
        sub: userId,
        sid: sessionId,
        jti: randomUUID(),
      },
      {
        secret: this.configService.getOrThrow<string>("JWT_REFRESH_SECRET"),
        expiresIn: "7d",
      },
    );
  }
}
