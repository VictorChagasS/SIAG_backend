/**
 * Upsert Student Grades DTOs
 *
 * Data Transfer Objects for creating or updating multiple grades
 * for a single student in a batch operation.
 *
 * @module GradeDTOs
 * @grades DTO
 */
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMinSize, IsArray, IsNumber, IsOptional, IsString, IsUUID, Max, Min, ValidateNested,
} from 'class-validator';

/**
 * DTO for a single grade item in a batch operation
 *
 * Contains the details of a single grade including evaluation item ID,
 * value, optional comments, and unit ID.
 *
 * @class GradeItemDto
 * @grades DTO
 */
export class GradeItemDto {
  /**
   * ID of the evaluation item this grade belongs to
   * Must be a valid UUID of an existing evaluation item
   *
   * @grades Property
   */
  @ApiProperty({
    description: 'ID do item de avaliação',
    example: '550e8400-e29b-41d4-a716-446655440002',
  })
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
  @IsString()
  @IsOptional()
    comments?: string;

  /**
   * ID of the unit the evaluation item belongs to
   * Used for validation and organization of grades
   *
   * @grades Property
   */
  @ApiProperty({
    description: 'ID da unidade à qual o item de avaliação pertence',
    example: '550e8400-e29b-41d4-a716-446655440003',
  })
  @IsString()
    unitId: string;
}

/**
 * DTO for handling batch grade creation/update requests for a student
 *
 * Contains an array of grade items to be created or updated in a single operation.
 * The student ID is provided via the route parameter rather than in this DTO.
 *
 * @class UpsertStudentGradesDto
 * @grades Batch
 */
export class UpsertStudentGradesDto {
  /**
   * Array of grade items to create or update
   * Must contain at least one item
   *
   * @grades Property
   */
  @ApiProperty({
    description: 'Lista de notas a serem inseridas/atualizadas',
    type: [GradeItemDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @ArrayMinSize(1)
  @Type(() => GradeItemDto)
    grades: GradeItemDto[];
}
