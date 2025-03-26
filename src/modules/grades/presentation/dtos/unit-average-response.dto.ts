/**
 * Unit Average Response DTOs
 *
 * Data Transfer Objects for returning unit average calculation results
 * including a student's grades and overall average within a unit.
 *
 * @module GradeDTOs
 * @grades DTO
 */
import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO for an individual grade item within a unit
 *
 * Contains the evaluation item's details and the grade value
 * for that particular item.
 *
 * @class GradeItemResponseDto
 * @grades Response
 */
class GradeItemResponseDto {
  /**
   * ID of the evaluation item
   * References an EvaluationItem entity
   *
   * @grades Property
   */
  @ApiProperty({
    description: 'ID do item de avaliação',
    example: '550e8400-e29b-41d4-a716-446655440002',
  })
    evaluationItemId: string;

  /**
   * Display name of the evaluation item
   * Used for UI presentation
   *
   * @grades Property
   */
  @ApiProperty({
    description: 'Nome do item de avaliação',
    example: 'Prova 1',
  })
    evaluationItemName: string;

  /**
   * Numeric value of the grade for this evaluation item
   * The actual score the student received
   *
   * @grades Property
   */
  @ApiProperty({
    description: 'Valor da nota',
    example: 8.5,
  })
    value: number;
}

/**
 * DTO for a student's average calculation within a unit
 *
 * Contains comprehensive information about a student's performance
 * within a specific unit, including overall average and individual grades.
 *
 * @class UnitAverageResponseDto
 * @grades Response
 */
export class UnitAverageResponseDto {
  /**
   * ID of the student whose average is being calculated
   * References a Student entity
   *
   * @grades Property
   */
  @ApiProperty({
    description: 'ID do estudante',
    example: '550e8400-e29b-41d4-a716-446655440001',
  })
    studentId: string;

  /**
   * Display name of the student
   * Used for UI presentation
   *
   * @grades Property
   */
  @ApiProperty({
    description: 'Nome do estudante',
    example: 'João da Silva',
  })
    studentName: string;

  /**
   * ID of the unit for which the average is calculated
   * References a Unit entity
   *
   * @grades Property
   */
  @ApiProperty({
    description: 'ID da unidade',
    example: '550e8400-e29b-41d4-a716-446655440003',
  })
    unitId: string;

  /**
   * Display name of the unit
   * Used for UI presentation
   *
   * @grades Property
   */
  @ApiProperty({
    description: 'Nome da unidade',
    example: 'Unidade 1',
  })
    unitName: string;

  /**
   * Calculated average for the unit
   * May be computed using a simple or custom formula
   *
   * @grades Property
   */
  @ApiProperty({
    description: 'Média das notas da unidade',
    example: 8.7,
  })
    average: number;

  /**
   * Array of individual grade items that contribute to the average
   * Contains all grades for the specified student within the unit
   *
   * @grades Property
   */
  @ApiProperty({
    description: 'Lista de notas dos itens de avaliação',
    type: [GradeItemResponseDto],
  })
    grades: GradeItemResponseDto[];
}
