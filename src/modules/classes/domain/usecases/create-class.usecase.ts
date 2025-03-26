/**
 * Create Class Use Case
 *
 * This use case handles the creation of new classes in the system,
 * including validation to prevent duplicate classes.
 *
 * @module ClassUseCases
 */
import { Inject, Injectable, ConflictException } from '@nestjs/common';

import { CLASS_REPOSITORY } from '../../classes.providers';
import { Class } from '../entities/class.entity';
import { IClassRepository } from '../repositories/class-repository.interface';

/**
 * Data Transfer Object for class creation
 *
 * Contains the data required to create a new class
 *
 * @interface ICreateClassDTO
 */
export interface ICreateClassDTO {
  /** Name of the class */
  name: string;

  /** Course code */
  code: string;

  /** Academic period (e.g., "2025.2") */
  period: string;

  /** ID of the teacher assigned to the class */
  teacherId: string;

  /** Optional section number (defaults to 1) */
  section?: number;
}

/**
 * Use case for creating new classes
 *
 * Handles the business logic for class creation, including
 * validation to prevent duplicate classes for the same teacher,
 * period, and name combination.
 *
 * @class CreateClassUseCase
 */
@Injectable()
export class CreateClassUseCase {
  /**
   * Creates an instance of CreateClassUseCase
   *
   * @param {IClassRepository} classRepository - Repository for class data access
   */
  constructor(
    @Inject(CLASS_REPOSITORY)
    private classRepository: IClassRepository,
  ) {}

  /**
   * Executes the class creation process
   *
   * Validates that the class doesn't already exist with the same name, period,
   * teacher, and section, then creates the new class.
   *
   * @param {ICreateClassDTO} data - Class data for creation
   * @returns {Promise<Class>} The newly created class
   * @throws {ConflictException} If a class with the same name, period, teacher, and section already exists
   */
  async execute(data: ICreateClassDTO): Promise<Class> {
    // Verificar se já existe uma turma com o mesmo nome e período para este professor
    const existingClass = await this.classRepository.findByNamePeriodAndTeacher(
      data.name,
      data.period,
      data.teacherId,
      data.section,
    );

    if (existingClass) {
      throw new ConflictException(
        'Você já possui uma turma com este nome neste período',
      );
    }

    const newClass = new Class({
      name: data.name,
      code: data.code,
      period: data.period,
      section: data.section,
      teacherId: data.teacherId,
    });

    return this.classRepository.create(newClass);
  }
}
