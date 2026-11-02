import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import type { Request } from "express";

type AuthenticatedRequest = Request & {
  user: {
    id: string;
  };
};

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();

    const [type, token] = request.headers.authorization?.split(" ") ?? [];

    if (type !== "Bearer" || !token) {
      throw new UnauthorizedException("Токен отстутствует");
    }

    try {
      const payload = await this.jwtService.verifyAsync<{ sub: string }>(token);
      request.user = { id: payload.sub };
      return true;
    } catch {
      throw new UnauthorizedException(
        "Недуйствительный или просроченный токен",
      );
    }
  }
}
