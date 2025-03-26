/**
 * Delete Class Use Case
 *
 * This use case handles the deletion of a class after validating
 * that the class exists.
 *
 * @module ClassUseCases
 */
import { Inject, Injectable, NotFoundException } from '@nestjs/common';

import { CLASS_REPOSITORY } from '../../classes.providers';
import { Class } from '../entities/class.entity';
import { IClassRepository } from '../repositories/class-repository.interface';

/**
 * Use case for deleting a class
 *
 * Handles the deletion process with validation to ensure
 * the class exists before attempting deletion.
 *
 * @class DeleteClassUseCase
 */
@Injectable()
export class DeleteClassUseCase {
  /**
   * Creates an instance of DeleteClassUseCase
   *
   * @param {IClassRepository} classRepository - Repository for class data access
   */
  constructor(
    @Inject(CLASS_REPOSITORY)
    private classRepository: IClassRepository,
  ) {}

  /**
   * Executes the delete class use case
   *
   * Validates that the class exists and then deletes it.
   * Returns the deleted class data for confirmation purposes.
   *
   * @param {string} id - ID of the class to delete
   * @returns {Promise<Class>} The deleted class entity
   * @throws {NotFoundException} If the class is not found
   */
  async execute(id: string): Promise<Class> {
    const classExists = await this.classRepository.findById(id);

    if (!classExists) {
      throw new NotFoundException('Classe não encontrada');
    }

    await this.classRepository.delete(id);

    return classExists;
  }
}
