import { Module } from "@nestjs/common";
import { AppController } from "./app.controller.js";
import { AppService } from "./app.service.js";
import { AuthModule } from "./auth/auth.module.js";
import { PrismaModule } from "./prisma/prisma.module.js";
import { ConfigModule } from "@nestjs/config";
import { UserModule } from './user/user.module.js';
import { NoteModule } from './note/note.module.js';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), PrismaModule, AuthModule, UserModule, NoteModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
