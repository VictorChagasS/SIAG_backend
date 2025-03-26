/**
 * Update Evaluation Item DTO
 *
 * Data Transfer Object for updating existing evaluation items.
 * Contains optional fields that can be updated.
 *
 * @module EvaluationItemDTOs
 * @evaluation-items DTO
 */
import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

/**
 * DTO for handling evaluation item update requests
 *
 * Contains optional fields that can be updated for an evaluation item.
 * All fields are optional since updates may modify only specific attributes.
 *
 * @class UpdateEvaluationItemDto
 * @evaluation-items Update
 */
export class UpdateEvaluationItemDto {
  /**
   * Updated name of the evaluation item
   *
   * Optional field that can be updated to change the identifier of the evaluation item.
   * Must remain unique within a unit if changed.
   *
   * @evaluation-items Property
   */
  @ApiProperty({
    description: 'Nome do item de avaliação',
    example: 'Prova Final',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'O nome deve ser uma string' })
    name?: string;
}
