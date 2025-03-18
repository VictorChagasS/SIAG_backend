import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty, IsOptional, IsString, Matches, IsInt, IsPositive,
} from 'class-validator';

export class CreateClassDto {
  @ApiProperty({
    description: 'Nome da turma',
    example: 'Programação Orientada a Objetos',
  })
  @IsString()
  @IsNotEmpty()
    name: string;

  @ApiProperty({
    description: 'Código da turma',
    example: 'CS101',
    required: false,
  })
  @IsString()
  @IsOptional()
    code?: string;

  @ApiProperty({
    description: 'Número da seção/turma',
    example: 1,
    required: false,
    default: 1,
  })
  @IsInt()
  @IsPositive()
  @IsOptional()
    section?: number;

  @ApiProperty({
    description: 'Período letivo no formato "YYYY.N"',
    example: '2025.2',
    pattern: '^\\d{4}\\.\\d+$',
  })
  @IsString()
  @IsNotEmpty()
  @Matches(/^\d{4}\.\d+$/, {
    message: 'O período deve estar no formato "YYYY.N" (ex: "2025.2")',
  })
    period: string;
}
