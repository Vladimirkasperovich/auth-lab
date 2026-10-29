import { Module } from "@nestjs/common";
import { UserService } from "./user.service.js";
import { UserController } from "./user.controller.js";
import { PrismaModule } from "../prisma/prisma.module.js";

@Module({
  imports: [PrismaModule],
  controllers: [UserController],
  providers: [UserService],
})
export class UserModule {}
