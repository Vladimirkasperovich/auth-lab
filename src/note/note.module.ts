import { Module } from "@nestjs/common";
import { NoteService } from "./note.service.js";
import { NoteController } from "./note.controller.js";
import { PrismaModule } from "../prisma/prisma.module.js";

@Module({
  imports: [PrismaModule],
  controllers: [NoteController],
  providers: [NoteService],
})
export class NoteModule {}
