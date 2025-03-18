/**
 * Unit Repository Interface
 *
 * Defines the contract for unit data access operations that must be implemented
 * by any concrete unit repository implementation.
 *
 * @module UnitRepositories
 * @units Domain
 */
import { Unit } from '../entities/unit.entity';

/**
 * Interface for unit-related data access operations
 *
 * Defines methods for creating, reading, updating, and deleting unit entities,
 * as well as specialized query methods for finding units by various criteria.
 *
 * @interface IUnitRepository
 * @units Repository
 */
export interface IUnitRepository {
  /**
   * Creates a new unit in the data store
   *
   * @param {Unit} unitData - The unit data to create
   * @returns {Promise<Unit>} The created unit with generated ID and timestamps
   * @units Create
   */
  create(unitData: Unit): Promise<Unit>;

  /**
   * Finds a unit by its unique identifier
   *
   * @param {string} id - The unit ID to search for
   * @returns {Promise<Unit | null>} The unit if found, null otherwise
   * @units Read
   */
  findById(id: string): Promise<Unit | null>;

  /**
   * Finds all units belonging to a specific class
   *
   * @param {string} classId - The class ID to search units for
   * @returns {Promise<Unit[]>} Array of units for the class
   * @units Read
   */
  findByClassId(classId: string): Promise<Unit[]>;

  /**
   * Finds a unit by name within a specific class
   *
   * @param {string} name - The unit name to search for
   * @param {string} classId - The class ID to search within
   * @returns {Promise<Unit | null>} The unit if found, null otherwise
   * @units Read
   */
  findByNameAndClassId(name: string, classId: string): Promise<Unit | null>;

  /**
   * Updates a unit's information
   *
   * @param {string} id - The unit ID to update
   * @param {Partial<Unit>} unitData - The data to update
   * @returns {Promise<Unit>} The updated unit
   * @units Update
   */
  update(id: string, unitData: Partial<Unit>): Promise<Unit>;

  /**
   * Deletes a unit from the data store
   *
   * @param {string} id - The unit ID to delete
   * @returns {Promise<void>}
   * @units Delete
   */
  delete(id: string): Promise<void>;
}
