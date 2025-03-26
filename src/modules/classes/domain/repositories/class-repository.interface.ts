/**
 * Class Repository Interface
 *
 * Defines the contract for all class repository implementations.
 * This interface outlines the operations that can be performed on class data.
 *
 * @module ClassRepositories
 */
import { IPaginatedResult, IPaginationNamePeriodSearchOptions } from '@/common/interfaces/pagination.interfaces';

import { Class } from '../entities/class.entity';

/**
 * Interface for class-related database operations
 *
 * Defines the methods that must be implemented by any class repository,
 * ensuring consistent data access patterns regardless of the underlying data store.
 *
 * @interface IClassRepository
 */
export interface IClassRepository {
  /**
   * Creates a new class in the database
   *
   * @param {Class} classData - The class data to create
   * @returns {Promise<Class>} The created class with generated ID and timestamps
   */
  create(classData: Class): Promise<Class>;

  /**
   * Finds a class by its ID
   *
   * @param {string} id - The class ID to search for
   * @returns {Promise<Class | null>} The class if found, null otherwise
   */
  findById(id: string): Promise<Class | null>;

  /**
   * Finds all classes taught by a specific teacher with pagination and filtering
   *
   * @param {string} teacherId - The teacher ID to filter by
   * @param {IPaginationNamePeriodSearchOptions} [options] - Pagination and search options
   * @returns {Promise<IPaginatedResult<Class>>} Paginated result of classes
   */
  findByTeacherId(teacherId: string, options?: IPaginationNamePeriodSearchOptions): Promise<IPaginatedResult<Class>>;

  /**
   * Finds active classes (current period) taught by a specific teacher
   *
   * @param {string} teacherId - The teacher ID to filter by
   * @param {string} [name] - Optional name filter
   * @returns {Promise<Class[]>} Array of active classes
   */
  findActiveByTeacherId(teacherId: string, name?: string): Promise<Class[]>;

  /**
   * Finds all classes in the system
   *
   * @returns {Promise<Class[]>} Array of all classes
   */
  findAll(): Promise<Class[]>;

  /**
   * Finds all active classes (current period) in the system
   *
   * @returns {Promise<Class[]>} Array of active classes
   */
  findAllActive(): Promise<Class[]>;

  /**
   * Updates a class's information
   *
   * @param {string} id - The class ID to update
   * @param {Partial<Class>} classData - The data to update
   * @returns {Promise<Class>} The updated class
   */
  update(id: string, classData: Partial<Class>): Promise<Class>;

  /**
   * Deletes a class from the database
   *
   * @param {string} id - The class ID to delete
   * @returns {Promise<void>}
   */
  delete(id: string): Promise<void>;

  /**
   * Finds a class by name, period, teacher and optionally section
   * Used to check if a class with these parameters already exists
   *
   * @param {string} name - The class name
   * @param {string} period - The academic period
   * @param {string} teacherId - The teacher ID
   * @param {number} [section] - Optional section number
   * @returns {Promise<Class | null>} The class if found, null otherwise
   */
  findByNamePeriodAndTeacher(name: string, period: string, teacherId: string, section?: number): Promise<Class | null>;
}
