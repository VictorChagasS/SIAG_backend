import { IsEmail, IsOptional, IsString } from 'class-validator';

export class UpdateStudentDto {
  @IsOptional()
  @IsString({ message: 'O nome deve ser uma string' })
    name?: string;

  @IsOptional()
  @IsEmail({}, { message: 'O email deve ser válido' })
    email?: string;

  @IsOptional()
  @IsString({ message: 'A matrícula deve ser uma string' })
    registration?: string;
}
