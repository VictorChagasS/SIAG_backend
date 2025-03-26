/**
 * Get Class Use Case
 *
 * This use case retrieves a single class by its ID with validation
 * to ensure the class exists.
 *
 * @module ClassUseCases
 */
import { Inject, Injectable, NotFoundException } from '@nestjs/common';

import { CLASS_REPOSITORY } from '../../classes.providers';
import { Class } from '../entities/class.entity';
import { IClassRepository } from '../repositories/class-repository.interface';

/**
 * Use case for retrieving a single class by its ID
 *
 * Fetches the complete class information and validates existence.
 *
 * @class GetClassUseCase
 */
@Injectable()
export class GetClassUseCase {
  /**
   * Creates an instance of GetClassUseCase
   *
   * @param {IClassRepository} classRepository - Repository for class data access
   */
  constructor(
    @Inject(CLASS_REPOSITORY)
    private classRepository: IClassRepository,
  ) {}

  /**
   * Executes the get class use case
   *
   * Retrieves a single class by its ID and validates that it exists.
   *
   * @param {string} id - ID of the class to retrieve
   * @returns {Promise<Class>} The class entity if found
   * @throws {NotFoundException} If the class is not found
   */
  async execute(id: string): Promise<Class> {
    const classFound = await this.classRepository.findById(id);

    if (!classFound) {
      throw new NotFoundException('Classe não encontrada');
    }

    return classFound;
  }
}
