/**
 * Top Students Report DTO
 *
 * Defines the data structure for reporting the highest-performing students
 * in a class, providing details about their grades and rankings.
 *
 * @module Reports
 */
import { ApiProperty } from '@nestjs/swagger';

/**
 * Information about a top-performing student
 */
export class TopStudentDto {
  /**
   * Unique identifier of the student
   */
  @ApiProperty({
    description: 'Unique identifier of the student',
    example: 'c3d4e5f6-a7b8-9012-cdef-123456789012',
  })
    studentId: string;

  /**
   * Name of the student
   */
  @ApiProperty({
    description: 'Name of the student',
    example: 'Maria Silva',
  })
    studentName: string;

  /**
   * Student's registration number
   */
  @ApiProperty({
    description: 'Student\'s registration number',
    example: '2023001',
  })
    registration: string;

  /**
   * Student's ranking position
   */
  @ApiProperty({
    description: 'Student\'s ranking position',
    example: 1,
  })
    rank: number;

  /**
   * Overall average grade
   */
  @ApiProperty({
    description: 'Overall average grade of the student',
    example: 9.8,
  })
    average: number;

  /**
   * Optional unit-specific grade
   * Only present if the report is for a specific unit
   */
  @ApiProperty({
    description: 'Unit-specific grade (if unit-specific report)',
    example: 9.7,
    required: false,
  })
    unitGrade?: number;
}

/**
 * Data Transfer Object for the top students report
 *
 * Contains a list of the highest-performing students in a class
 */
export class TopStudentsReportDto {
  /**
   * Unique identifier of the class
   */
  @ApiProperty({
    description: 'Unique identifier of the class',
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  })
    classId: string;

  /**
   * Name of the class
   */
  @ApiProperty({
    description: 'Name of the class',
    example: 'Matemática - 9º Ano A',
  })
    className: string;

  /**
   * Optional identifier of a specific unit
   * If provided, the report will be for student performance in that unit only
   */
  @ApiProperty({
    description: 'Optional unit identifier for unit-specific rankings',
    example: 'b2c3d4e5-f6a7-8901-bcde-f12345678901',
    required: false,
  })
    unitId?: string;

  /**
   * Optional name of a specific unit
   * Only present if unitId is provided
   */
  @ApiProperty({
    description: 'Name of the unit (if unit-specific report)',
    example: 'Unidade 2 - Geometria',
    required: false,
  })
    unitName?: string;

  /**
   * List of top-performing students
   */
  @ApiProperty({
    description: 'List of top-performing students',
    type: [TopStudentDto],
  })
    topStudents: TopStudentDto[];

  /**
   * Total number of students in the class
   */
  @ApiProperty({
    description: 'Total number of students in the class',
    example: 32,
  })
    totalStudents: number;

  /**
   * Date when the report was generated
   */
  @ApiProperty({
    description: 'Date when the report was generated',
    example: '2023-06-15T14:30:45Z',
  })
    generatedAt: Date;
}
