/**
 * Evaluation Item Entity
 *
 * An evaluation item is an assessment component that belongs to a specific unit,
 * such as tests, assignments, presentations, exercises, etc.
 *
 * @module EvaluationItemEntities
 * @evaluation-items Entity
 */

/**
 * Represents an evaluation item in the system
 *
 * This class encapsulates the data of an evaluation item, including its name
 * and the unit it belongs to.
 *
 * @class EvaluationItem
 * @evaluation-items Entity
 */
export class EvaluationItem {
  /**
   * Unique identifier of the evaluation item
   * @evaluation-items Property
   */
  id?: string;

  /**
   * Name of the evaluation item (e.g., "Test 1", "Final Project", "Presentation")
   * @evaluation-items Property
   */
  name: string;

  /**
   * Identifier of the unit this evaluation item belongs to
   * @evaluation-items Property
   */
  unitId: string;

  /**
   * Date and time when the record was created
   * @evaluation-items Property
   */
  createdAt?: Date;

  /**
   * Date and time when the record was last updated
   * @evaluation-items Property
   */
  updatedAt?: Date;

  /**
   * Creates a new instance of an evaluation item
   * @param props Properties to initialize the evaluation item
   * @evaluation-items Constructor
   */
  constructor(props: Omit<EvaluationItem, 'createdAt' | 'updatedAt'>) {
    Object.assign(this, props);
  }
}
