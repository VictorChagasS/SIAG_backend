import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail, IsNotEmpty, IsOptional, IsString,
} from 'class-validator';

export class CreateStudentDto {
  @ApiProperty({
    description: 'Nome completo do estudante',
    example: 'João da Silva',
  })
  @IsNotEmpty()
  @IsString({ message: 'O nome deve ser uma string' })
    name: string;

  @ApiProperty({
    description: 'E-mail do estudante (opcional)',
    example: 'joao.silva@exemplo.com',
    required: false,
  })
  @IsOptional()
  @IsEmail({}, { message: 'O email deve ser válido' })
    email?: string;

  @ApiProperty({
    description: 'Número de matrícula do estudante',
    example: '20230001',
  })
  @IsNotEmpty()
  @IsString()
    registration: string;
}
