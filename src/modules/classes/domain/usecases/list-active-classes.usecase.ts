/**
 * List Active Classes Use Case
 *
 * This use case retrieves all active classes (current period)
 * from the system, regardless of the teacher.
 *
 * @module ClassUseCases
 */
import { Inject, Injectable } from '@nestjs/common';

import { CLASS_REPOSITORY } from '../../classes.providers';
import { Class } from '../entities/class.entity';
import { IClassRepository } from '../repositories/class-repository.interface';

/**
 * Use case for listing all active classes
 *
 * Provides access to currently active classes across the system.
 * Active classes are those in the current academic period.
 *
 * @class ListActiveClassesUseCase
 */
@Injectable()
export class ListActiveClassesUseCase {
  /**
   * Creates an instance of ListActiveClassesUseCase
   *
   * @param {IClassRepository} classRepository - Repository for class data access
   */
  constructor(
    @Inject(CLASS_REPOSITORY)
    private classRepository: IClassRepository,
  ) {}

  /**
   * Executes the list active classes use case
   *
   * Retrieves all classes from the current academic period.
   *
   * @returns {Promise<Class[]>} Array of active class entities
   */
  async execute(): Promise<Class[]> {
    return this.classRepository.findAllActive();
  }
}
