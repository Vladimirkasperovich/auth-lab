import { Injectable } from '@nestjs/common';
import { CreateNoteDto } from './dto/create-note.dto.js';
import { UpdateNoteDto } from './dto/update-note.dto.js';

@Injectable()
export class NoteService {
  create(createNoteDto: CreateNoteDto) {
    return 'This action adds a new note';
  }

  findAll() {
    return `This action returns all note`;
  }

  findOne(id: number) {
    return `This action returns a #${id} note`;
  }

  update(id: number, updateNoteDto: UpdateNoteDto) {
    return `This action updates a #${id} note`;
  }

  remove(id: number) {
    return `This action removes a #${id} note`;
  }
}
