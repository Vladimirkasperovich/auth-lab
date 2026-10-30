import { NoteDto } from "../../note/dto/note.dto.js";

export class UserDto {
  id: string;
  email: string;
  password: string;
  name: string;
  notes: NoteDto[];
  createdAt: Date;
  updatedAt: Date;
}
