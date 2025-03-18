/**
 * Create Class DTO
 *
 * Data Transfer Object for creating a new class.
 * Contains validation rules for ensuring data integrity when creating classes.
 *
 * @module ClassDTOs
 */
import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty, IsOptional, IsString, Matches, IsInt, IsPositive,
} from 'class-validator';

/**
 * DTO for handling class creation requests
 *
 * Contains the required data to create a new class with
 * appropriate validation rules for each field.
 *
 * @class CreateClassDto
 */
export class CreateClassDto {
  /**
   * Name of the class
   * Required field, must be a non-empty string
   */
  @ApiProperty({
    description: 'Nome da turma',
    example: 'Programação Orientada a Objetos',
  })
  @IsString()
  @IsNotEmpty()
    name: string;

  /**
   * Course code/identifier
   * Optional field, typically a short identifier for the course
   */
  @ApiProperty({
    description: 'Código da turma',
    example: 'CS101',
    required: false,
  })
  @IsString()
  @IsOptional()
    code?: string;

  /**
   * Section number of the class
   * Optional field, must be a positive integer (defaults to 1)
   */
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

  /**
   * Academic period when the class is offered
   * Required field, must follow the format "YYYY.N" (e.g., "2025.2")
   */
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
