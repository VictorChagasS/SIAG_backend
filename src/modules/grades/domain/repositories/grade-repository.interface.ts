/**
 * Grade Repository Interface
 *
 * Defines the contract for grade data access operations that must be implemented
 * by any concrete grade repository implementation.
 *
 * @module GradeRepositories
 * @grades Domain
 */
import { Grade } from '../entities/grade.entity';

/**
 * Repository interface for grade-related database operations
 *
 * @interface IGradeRepository
 * @grades Repository
 */
export interface IGradeRepository {
  /**
   * Creates a new grade in the data store
   *
   * @param {Grade} gradeData - The grade data to create
   * @returns {Promise<Grade>} The created grade with generated ID and timestamps
   * @grades Create
   */
  create(gradeData: Grade): Promise<Grade>;

  /**
   * Creates or updates multiple grades in a single operation
   *
   * @param {Grade[]} gradesData - Array of grade data to create or update
   * @returns {Promise<Grade[]>} The created/updated grades
   * @grades Create
   */
  upsertMany(gradesData: Grade[]): Promise<Grade[]>;

  /**
   * Finds a grade by its unique identifier
   *
   * @param {string} id - The grade ID to search for
   * @returns {Promise<Grade | null>} The grade if found, null otherwise
   * @grades Read
   */
  findById(id: string): Promise<Grade | null>;

  /**
   * Finds a grade for a specific student and evaluation item
   *
   * @param {string} studentId - The student ID
   * @param {string} evaluationItemId - The evaluation item ID
   * @returns {Promise<Grade | null>} The grade if found, null otherwise
   * @grades Read
   */
  findByStudentAndEvaluationItem(studentId: string, evaluationItemId: string): Promise<Grade | null>;

  /**
   * Finds all grades for a specific evaluation item
   *
   * @param {string} evaluationItemId - The evaluation item ID to find grades for
   * @returns {Promise<Grade[]>} Array of grades for the evaluation item
   * @grades Read
   */
  findByEvaluationItem(evaluationItemId: string): Promise<Grade[]>;

  /**
   * Finds all grades for a specific student within a unit
   *
   * @param {string} studentId - The student ID
   * @param {string} unitId - The unit ID
   * @returns {Promise<Grade[]>} Array of grades for the student in the unit
   * @grades Read
   */
  findByStudentAndUnit(studentId: string, unitId: string): Promise<Grade[]>;

  /**
   * Finds all grades for a specific unit
   *
   * @param {string} unitId - The unit ID to find grades for
   * @returns {Promise<Grade[]>} Array of grades for the unit
   * @grades Read
   */
  findByUnit(unitId: string): Promise<Grade[]>;

  /**
   * Updates a grade's information
   *
   * @param {string} id - The grade ID to update
   * @param {Partial<Grade>} gradeData - The data to update
   * @returns {Promise<Grade>} The updated grade
   * @grades Update
   */
  update(id: string, gradeData: Partial<Grade>): Promise<Grade>;

  /**
   * Deletes a grade from the data store
   *
   * @param {string} id - The grade ID to delete
   * @returns {Promise<void>}
   * @grades Delete
   */
  delete(id: string): Promise<void>;
}
