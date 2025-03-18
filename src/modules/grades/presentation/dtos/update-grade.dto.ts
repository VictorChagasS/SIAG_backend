/**
 * Update Grade DTO
 *
 * Data Transfer Object for updating existing grades in the system.
 * Contains the fields that can be modified during grade update.
 *
 * @module GradeDTOs
 * @grades DTO
 */
import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty, IsNumber, IsOptional, IsString, Max, Min,
} from 'class-validator';

/**
 * DTO for handling grade update requests
 *
 * Contains the required value and optional comments for updating a grade.
 * The grade ID is provided via the route parameter rather than in this DTO.
 *
 * @class UpdateGradeDto
 * @grades Update
 */
export class UpdateGradeDto {
  /**
   * Updated numeric value of the grade
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
   * Updated optional comments about the grade
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
