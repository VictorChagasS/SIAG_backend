import { Student } from '../entities/student.entity';

/**
 * Interface for search options when querying students
 *
 * @interface IStudentSearchOptions
 * @property {string} [search] - Search term to filter students by name or registration number
 */
export interface IStudentSearchOptions {
  /**
   * Search term to filter students by name or registration number
   */
  search?: string;
}

/**
 * Repository interface for student-related database operations
 *
 * @interface IStudentRepository
 */
export interface IStudentRepository {
  /**
   * Creates a new student in the database
   *
   * @param {Student} studentData - The student data to create
   * @returns {Promise<Student>} The created student
   */
  create(studentData: Student): Promise<Student>;

  /**
   * Finds a student by its ID
   *
   * @param {string} id - The student ID
   * @returns {Promise<Student | null>} The student if found, null otherwise
   */
  findById(id: string): Promise<Student | null>;

  /**
   * Finds all students from a specific class, with optional search filtering
   *
   * @param {string} classId - The class ID to search students for
   * @param {IStudentSearchOptions} [options] - Optional search parameters
   * @returns {Promise<Student[]>} Array of students matching the criteria
   */
  findByClassId(classId: string, options?: IStudentSearchOptions): Promise<Student[]>;

  /**
   * Finds a student by registration number within a specific class
   *
   * @param {string} registration - The registration number to search for
   * @param {string} classId - The class ID to search in
   * @returns {Promise<Student | null>} The student if found, null otherwise
   */
  findByRegistrationAndClassId(registration: string, classId: string): Promise<Student | null>;

  /**
   * Updates a student's information
   *
   * @param {string} id - The student ID to update
   * @param {Partial<Student>} studentData - The data to update
   * @returns {Promise<Student>} The updated student
   */
  update(id: string, studentData: Partial<Student>): Promise<Student>;

  /**
   * Deletes a student from the database
   *
   * @param {string} id - The student ID to delete
   * @returns {Promise<void>}
   */
  delete(id: string): Promise<void>;
}
