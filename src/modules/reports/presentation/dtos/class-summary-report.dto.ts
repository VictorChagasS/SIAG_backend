/**
 * Class Summary Report DTO
 *
 * Defines the data structure for a comprehensive class performance summary,
 * including overall statistics like class average, approval rate, and student count.
 *
 * @module Reports
 */
import { ApiProperty } from '@nestjs/swagger';

/**
 * Data Transfer Object for the class summary report
 *
 * Contains aggregate statistics about class performance
 */
export class ClassSummaryReportDto {
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
   * Overall average grade for the entire class
   */
  @ApiProperty({
    description: 'Average grade for the entire class',
    example: 7.8,
  })
    classAverage: number;

  /**
   * Total number of students in the class
   */
  @ApiProperty({
    description: 'Total number of students in the class',
    example: 32,
  })
    totalStudents: number;

  /**
   * Number of students who have achieved passing grades
   */
  @ApiProperty({
    description: 'Number of students with passing grades',
    example: 28,
  })
    studentsApproved: number;

  /**
   * Percentage of students who achieved passing grades (0-100)
   */
  @ApiProperty({
    description: 'Percentage of students with passing grades (0-100)',
    example: 87.5,
  })
    approvalRate: number;

  /**
   * Highest grade achieved in the class
   */
  @ApiProperty({
    description: 'Highest grade in the class',
    example: 9.8,
  })
    highestGrade: number;

  /**
   * Lowest grade achieved in the class
   */
  @ApiProperty({
    description: 'Lowest grade in the class',
    example: 3.2,
  })
    lowestGrade: number;

  /**
   * Median grade in the class (half of students above, half below)
   */
  @ApiProperty({
    description: 'Median grade in the class',
    example: 7.5,
  })
    medianGrade: number;

  /**
   * Date when the report was generated
   */
  @ApiProperty({
    description: 'Date when the report was generated',
    example: '2023-06-15T14:30:45Z',
  })
    generatedAt: Date;
}
