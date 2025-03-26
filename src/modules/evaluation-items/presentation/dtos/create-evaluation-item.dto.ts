/**
 * Create Evaluation Item DTO
 *
 * Data Transfer Object for creating new evaluation items within a unit.
 * Contains the minimal required data for evaluation item creation.
 *
 * @module EvaluationItemDTOs
 * @evaluation-items DTO
 */
import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsNotEmpty, IsString } from 'class-validator';

/**
 * DTO for handling evaluation item creation requests
 *
 * Contains the required name for creating a new evaluation item.
 * The unit ID is provided via the route parameter rather than in this DTO.
 *
 * @class CreateEvaluationItemDto
 * @evaluation-items Create
 */
export class CreateEvaluationItemDto {
  /**
   * Name of the evaluation item
   *
   * Required field that identifies the evaluation item within a unit.
   * Examples include "Test 1", "Final Project", "Presentation", etc.
   *
   * @evaluation-items Property
   */
  @ApiProperty({
    description: 'Nome do item de avaliação',
    example: 'Prova 1',
  })
  @IsNotEmpty({ message: 'O nome é obrigatório' })
  @IsString({ message: 'O nome deve ser uma string' })
    name: string;

  /**
   * Date of creation of the evaluation item
   */
  @ApiProperty({
    description: 'Data de criação do item de avaliação',
    example: '2025-01-01',
  })
  @IsNotEmpty({ message: 'A data de criação é obrigatória' })
  @IsDateString({ strict: true }, { message: 'A data de criação deve ser uma data válida' })
    createdAt: Date;
}
