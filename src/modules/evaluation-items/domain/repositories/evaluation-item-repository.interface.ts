/**
 * Evaluation Item Repository Interface
 *
 * Defines the contract for evaluation item data access operations that must be implemented
 * by any concrete evaluation item repository implementation.
 *
 * @module EvaluationItemRepositories
 * @evaluation-items Domain
 */
import { EvaluationItem } from '../entities/evaluation-item.entity';

/**
 * Interface for evaluation item-related data access operations
 *
 * Defines methods for creating, reading, updating, and deleting evaluation item entities,
 * as well as specialized query methods for finding evaluation items by various criteria.
 *
 * @interface IEvaluationItemRepository
 * @evaluation-items Repository
 */
export interface IEvaluationItemRepository {
  /**
   * Creates a new evaluation item in the data store
   *
   * @param {EvaluationItem} evaluationItemData - The evaluation item data to create
   * @returns {Promise<EvaluationItem>} The created evaluation item with generated ID and timestamps
   * @evaluation-items Create
   */
  create(evaluationItemData: EvaluationItem): Promise<EvaluationItem>;

  /**
   * Finds an evaluation item by its unique identifier
   *
   * @param {string} id - The evaluation item ID to search for
   * @returns {Promise<EvaluationItem | null>} The evaluation item if found, null otherwise
   * @evaluation-items Read
   */
  findById(id: string): Promise<EvaluationItem | null>;

  /**
   * Finds all evaluation items belonging to a specific unit
   *
   * @param {string} unitId - The unit ID to search evaluation items for
   * @returns {Promise<EvaluationItem[]>} Array of evaluation items for the unit
   * @evaluation-items Read
   */
  findByUnitId(unitId: string): Promise<EvaluationItem[]>;

  /**
   * Finds an evaluation item by name within a specific unit
   *
   * @param {string} name - The evaluation item name to search for
   * @param {string} unitId - The unit ID to search within
   * @returns {Promise<EvaluationItem | null>} The evaluation item if found, null otherwise
   * @evaluation-items Read
   */
  findByNameAndUnitId(name: string, unitId: string): Promise<EvaluationItem | null>;

  /**
   * Updates an evaluation item's information
   *
   * @param {string} id - The evaluation item ID to update
   * @param {Partial<EvaluationItem>} evaluationItemData - The data to update
   * @returns {Promise<EvaluationItem>} The updated evaluation item
   * @evaluation-items Update
   */
  update(id: string, evaluationItemData: Partial<EvaluationItem>): Promise<EvaluationItem>;

  /**
   * Deletes an evaluation item from the data store
   *
   * @param {string} id - The evaluation item ID to delete
   * @returns {Promise<void>}
   * @evaluation-items Delete
   */
  delete(id: string): Promise<void>;
}
