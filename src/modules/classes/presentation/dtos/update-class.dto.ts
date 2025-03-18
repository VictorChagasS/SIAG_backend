/**
 * Update Class DTO
 *
 * Data Transfer Object for updating an existing class.
 * Contains validation rules for ensuring data integrity when updating classes.
 * All fields are optional since updates can be partial.
 *
 * @module ClassDTOs
 */
import { ApiProperty } from '@nestjs/swagger';
import {
  IsOptional, IsString, Matches, IsInt, IsPositive,
} from 'class-validator';

/**
 * DTO for handling class update requests
 *
 * Contains the optional data to update an existing class with
 * appropriate validation rules for each field.
 *
 * @class UpdateClassDto
 */
export class UpdateClassDto {
  /**
   * Updated name of the class
   * Optional field, must be a string if provided
   */
  @ApiProperty({
    description: 'Nome da turma',
    example: 'Programação Orientada a Objetos',
    required: false,
  })
  @IsString()
  @IsOptional()
    name?: string;

  /**
   * Updated course code/identifier
   * Optional field, must be a string if provided
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
   * Updated section number of the class
   * Optional field, must be a positive integer if provided
   */
  @ApiProperty({
    description: 'Número da seção/turma',
    example: 1,
    required: false,
  })
  @IsInt()
  @IsPositive()
  @IsOptional()
    section?: number;

  /**
   * Updated academic period when the class is offered
   * Optional field, must follow the format "YYYY.N" (e.g., "2025.2") if provided
   */
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
