/**
 * Grade Distribution Report DTO
 *
 * Defines the data structure for reporting the distribution of grades across
 * predefined ranges, providing insights into the overall class performance patterns.
 *
 * @module Reports
 */
import { ApiProperty } from '@nestjs/swagger';

/**
 * Grade range information for distribution analysis
 */
export class GradeRangeDto {
  /**
   * Lower bound of the grade range (inclusive)
   */
  @ApiProperty({
    description: 'Lower bound of the grade range (inclusive)',
    example: 7.0,
  })
    min: number;

  /**
   * Upper bound of the grade range (inclusive)
   */
  @ApiProperty({
    description: 'Upper bound of the grade range (inclusive)',
    example: 8.0,
  })
    max: number;

  /**
   * Number of students with grades in this range
   */
  @ApiProperty({
    description: 'Number of students with grades in this range',
    example: 12,
  })
    count: number;

  /**
   * Percentage of total students with grades in this range (0-100)
   */
  @ApiProperty({
    description: 'Percentage of students with grades in this range (0-100)',
    example: 37.5,
  })
    percentage: number;
}

/**
 * Data Transfer Object for the grade distribution report
 *
 * Contains a breakdown of how grades are distributed across different ranges
 */
export class GradeDistributionReportDto {
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
   * If provided, the report will be for grades in that unit only
   */
  @ApiProperty({
    description: 'Optional unit identifier for unit-specific distributions',
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
   * Collection of grade ranges and their statistics
   */
  @ApiProperty({
    description: 'Collection of grade ranges and their statistics',
    type: [GradeRangeDto],
  })
    distribution: GradeRangeDto[];

  /**
   * Total number of students included in the report
   */
  @ApiProperty({
    description: 'Total number of students included in the report',
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
