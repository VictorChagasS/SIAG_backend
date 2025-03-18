/**
 * Class Response DTO
 *
 * Data Transfer Object for class responses returned by API endpoints.
 * Contains all the class information that should be exposed through the API.
 *
 * @module ClassDTOs
 */
import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO representing a class in API responses
 *
 * Contains all necessary class information formatted for API consumers,
 * including metadata like creation and update timestamps.
 *
 * @class ClassResponseDto
 */
export class ClassResponseDto {
  /**
   * Unique identifier for the class
   */
  @ApiProperty({
    description: 'ID da turma',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
    id: string;

  /**
   * Name of the class/course
   */
  @ApiProperty({
    description: 'Nome da turma',
    example: 'Programação Orientada a Objetos',
  })
    name: string;

  /**
   * Course code/identifier
   * Can be null if not provided
   */
  @ApiProperty({
    description: 'Código da turma',
    example: 'CS101',
    nullable: true,
  })
    code: string | null;

  /**
   * Section number of the class
   * Defaults to 1 if not specified
   */
  @ApiProperty({
    description: 'Número da seção/turma',
    example: 1,
    default: 1,
  })
    section: number;

  /**
   * Academic period when the class is offered
   * Format: "YYYY.N" (e.g., "2025.2")
   */
  @ApiProperty({
    description: 'Período letivo no formato "YYYY.N"',
    example: '2025.2',
  })
    period: string;

  /**
   * ID of the teacher assigned to the class
   */
  @ApiProperty({
    description: 'ID do professor da turma',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
    teacherId: string;

  /**
   * Type of formula used for grade calculation
   * Either 'simple' (system default) or 'personalized' (custom)
   */
  @ApiProperty({
    description: 'Tipo de fórmula para cálculo da média',
    enum: ['simple', 'personalized'],
    example: 'simple',
  })
    typeFormula: 'simple' | 'personalized';

  /**
   * Custom formula for calculating class averages
   * Only used when typeFormula is 'personalized', null otherwise
   */
  @ApiProperty({
    description: 'Fórmula personalizada para cálculo da média. As notas são representadas por N1, N2, N3, etc.',
    example: '(N1 * 2 + N2 * 3 + N3 * 5) / 10',
    nullable: true,
  })
    averageFormula: string | null;

  /**
   * Number of students enrolled in the class
   * Can be null if not calculated
   */
  @ApiProperty({
    description: 'Quantidade de estudantes na turma',
    example: 30,
    nullable: true,
  })
    studentCount: number | null;

  /**
   * Timestamp when the class was created
   */
  @ApiProperty({
    description: 'Data de criação da turma',
    example: '2025-01-01T00:00:00.000Z',
  })
    createdAt: Date;

  /**
   * Timestamp when the class was last updated
   */
  @ApiProperty({
    description: 'Data de atualização da turma',
    example: '2025-01-01T00:00:00.000Z',
  })
    updatedAt: Date;
}
