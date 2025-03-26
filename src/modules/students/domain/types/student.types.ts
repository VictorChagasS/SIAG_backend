/**
 * Student Types
 *
 * Defines additional types related to students beyond the base entity.
 * Includes types for extended student information and specialized views.
 *
 * @module StudentTypes
 * @students Domain
 */
import { Student } from '../entities/student.entity';

/**
 * Extended student interface that includes grade average
 *
 * Represents a student with their calculated grade average,
 * typically used when listing students with performance metrics.
 *
 * @interface IStudentWithAverage
 * @extends {Student}
 * @students Type
 */
export interface IStudentWithAverage extends Student {
  /**
   * The calculated grade average for the student
   * Represents the student's overall performance across all evaluation items
   *
   * @students Property
   */
  average: number;
}
