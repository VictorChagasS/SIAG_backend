import {
  IsEmail, IsNotEmpty, IsOptional, IsString,
} from 'class-validator';

export class CreateStudentDto {
  @IsNotEmpty()
  @IsString({ message: 'O nome deve ser uma string' })
    name: string;

  @IsOptional()
  @IsEmail({}, { message: 'O email deve ser válido' })
    email?: string;

  @IsNotEmpty()
  @IsString()
    registration: string;
}
