/**
 * Create Grade DTO
 *
 * Data Transfer Object for creating new grades within the system.
 * Contains the required fields for grade creation.
 *
 * @module GradeDTOs
 * @grades DTO
 */
import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID, Max, Min,
} from 'class-validator';

/**
 * DTO for handling grade creation requests
 *
 * Contains the required student ID, evaluation item ID, value, and optional comments
 * for creating a new grade. Used with proper validation rules.
 *
 * @class CreateGradeDto
 * @grades Create
 */
export class CreateGradeDto {
  /**
   * ID of the student receiving the grade
   * Must be a valid UUID of an existing student
   *
   * @grades Property
   */
  @ApiProperty({
    description: 'ID do estudante ao qual a nota pertence',
    example: '550e8400-e29b-41d4-a716-446655440001',
  })
  @IsNotEmpty()
  @IsUUID()
    studentId: string;

  /**
   * ID of the evaluation item the grade belongs to
   * Must be a valid UUID of an existing evaluation item
   *
   * @grades Property
   */
  @ApiProperty({
    description: 'ID do item de avaliação ao qual a nota pertence',
    example: '550e8400-e29b-41d4-a716-446655440002',
  })
  @IsNotEmpty()
  @IsUUID()
    evaluationItemId: string;

  /**
   * Numeric value of the grade
   * Must be between 0 and 10 inclusive
   *
   * @grades Property
   */
  @ApiProperty({
    description: 'Valor da nota (entre 0 e 10)',
    example: 8.5,
    minimum: 0,
    maximum: 10,
  })
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  @Max(10)
    value: number;

  /**
   * Optional comments about the grade
   * Can include feedback, observations, or justifications
   *
   * @grades Property
   */
  @ApiProperty({
    description: 'Comentários sobre a nota',
    example: 'Excelente participação em sala de aula',
    required: false,
  })
  @IsOptional()
  @IsString()
    comments?: string;
}
