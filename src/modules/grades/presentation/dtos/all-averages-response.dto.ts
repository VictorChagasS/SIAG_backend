/**
 * All Averages Response DTOs
 *
 * Data Transfer Objects for returning comprehensive grade average calculations
 * for all students in a class, including unit-specific and overall averages.
 *
 * @module GradeDTOs
 * @grades DTO
 */
import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO for a unit's average calculation
 *
 * Contains information about a specific unit and the calculated
 * average grade for that unit.
 *
 * @class UnitAverageDto
 * @grades Response
 */
class UnitAverageDto {
  /**
   * ID of the unit
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
}

/**
 * DTO for a student's overall and unit-specific averages
 *
 * Contains information about a specific student and their
 * calculated averages across all units.
 *
 * @class StudentAverageDto
 * @grades Response
 */
class StudentAverageDto {
  /**
   * ID of the student
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
   * Overall average of the student across all units
   * May be computed using a simple or custom formula
   *
   * @grades Property
   */
  @ApiProperty({
    description: 'Média geral do estudante',
    example: 8.5,
  })
    average: number;

  /**
   * Array of unit-specific averages for this student
   * Contains the average for each unit the student is enrolled in
   *
   * @grades Property
   */
  @ApiProperty({
    description: 'Lista de médias por unidade',
    type: [UnitAverageDto],
  })
    unitAverages: UnitAverageDto[];
}

/**
 * DTO for all students' averages within a class
 *
 * Contains comprehensive information about all students'
 * performances within a class, including overall and unit-specific averages.
 *
 * @class AllAveragesResponseDto
 * @grades Response
 */
export class AllAveragesResponseDto {
  /**
   * ID of the class
   * References a Class entity
   *
   * @grades Property
   */
  @ApiProperty({
    description: 'ID da turma',
    example: '550e8400-e29b-41d4-a716-446655440004',
  })
    classId: string;

  /**
   * Display name of the class
   * Used for UI presentation
   *
   * @grades Property
   */
  @ApiProperty({
    description: 'Nome da turma',
    example: 'Matemática - Turma A',
  })
    className: string;

  /**
   * Array of student averages in this class
   * Contains overall and unit-specific averages for each student
   *
   * @grades Property
   */
  @ApiProperty({
    description: 'Lista de médias dos estudantes',
    type: [StudentAverageDto],
  })
    studentAverages: StudentAverageDto[];
}
