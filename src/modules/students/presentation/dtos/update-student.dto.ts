import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString } from 'class-validator';

export class UpdateStudentDto {
  @ApiProperty({
    description: 'Nome completo do estudante',
    example: 'João da Silva',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'O nome deve ser uma string' })
    name?: string;

  @ApiProperty({
    description: 'E-mail do estudante',
    example: 'joao.silva@exemplo.com',
    required: false,
  })
  @IsOptional()
  @IsEmail({}, { message: 'O email deve ser válido' })
    email?: string;

  @ApiProperty({
    description: 'Número de matrícula do estudante',
    example: '20230001',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'A matrícula deve ser uma string' })
    registration?: string;
}
