/**
 * List Classes Use Case
 *
 * This use case retrieves all classes from the system,
 * regardless of period or teacher.
 *
 * @module ClassUseCases
 */
import { Inject, Injectable } from '@nestjs/common';

import { CLASS_REPOSITORY } from '../../classes.providers';
import { Class } from '../entities/class.entity';
import { IClassRepository } from '../repositories/class-repository.interface';

/**
 * Use case for listing all classes
 *
 * Provides access to all classes across the system,
 * regardless of their period or associated teacher.
 *
 * @class ListClassesUseCase
 */
@Injectable()
export class ListClassesUseCase {
  /**
   * Creates an instance of ListClassesUseCase
   *
   * @param {IClassRepository} classRepository - Repository for class data access
   */
  constructor(
    @Inject(CLASS_REPOSITORY)
    private classRepository: IClassRepository,
  ) {}

  /**
   * Executes the list classes use case
   *
   * Retrieves all classes from the system without filtering.
   *
   * @returns {Promise<Class[]>} Array of all class entities
   */
  async execute(): Promise<Class[]> {
    return this.classRepository.findAll();
  }
}
