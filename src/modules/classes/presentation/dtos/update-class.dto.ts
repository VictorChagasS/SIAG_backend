import { ApiProperty } from '@nestjs/swagger';
import {
  IsOptional, IsString, Matches, IsInt, IsPositive,
} from 'class-validator';

export class UpdateClassDto {
  @ApiProperty({
    description: 'Nome da turma',
    example: 'Programação Orientada a Objetos',
    required: false,
  })
  @IsString()
  @IsOptional()
    name?: string;

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
  })
  @IsInt()
  @IsPositive()
  @IsOptional()
    section?: number;

  @ApiProperty({
    description: 'Período letivo no formato "YYYY.N"',
    example: '2025.2',
    pattern: '^\\d{4}\\.\\d+$',
    required: false,
  })
  @IsString()
  @IsOptional()
  @Matches(/^\d{4}\.\d+$/, {
    message: 'O período deve estar no formato "YYYY.N" (ex: "2025.2")',
  })
    period?: string;
}
