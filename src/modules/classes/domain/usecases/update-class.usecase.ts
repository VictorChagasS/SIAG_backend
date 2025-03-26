/**
 * Update Class Use Case
 *
 * This use case handles the updating of an existing class with validation
 * to ensure data integrity and proper authorization.
 *
 * @module ClassUseCases
 */
import {
  Inject, Injectable, NotFoundException, ConflictException, ForbiddenException,
} from '@nestjs/common';

import { CLASS_REPOSITORY } from '../../classes.providers';
import { Class } from '../entities/class.entity';
import { IClassRepository } from '../repositories/class-repository.interface';

/**
 * Parameters for updating a class
 *
 * Contains the optional fields that can be updated on a class entity.
 * All fields are optional since updates can be partial.
 *
 * @interface IUpdateClassDTO
 */
export interface IUpdateClassDTO {
  /** Updated name of the class */
  name?: string;

  /** Updated academic period (e.g., "2025.2") */
  period?: string;

  /** Updated section number */
  section?: number;
}

/**
 * Use case for updating an existing class
 *
 * Handles the business logic for updating a class, including authorization
 * checks and validation to prevent duplicates.
 *
 * @class UpdateClassUseCase
 */
@Injectable()
export class UpdateClassUseCase {
  /**
   * Creates an instance of UpdateClassUseCase
   *
   * @param {IClassRepository} classRepository - Repository for class data access
   */
  constructor(
    @Inject(CLASS_REPOSITORY)
    private classRepository: IClassRepository,
  ) {}

  /**
   * Executes the update class use case
   *
   * Updates an existing class with new data after performing validation
   * and authorization checks to ensure the operation is valid.
   *
   * @param {string} id - ID of the class to update
   * @param {IUpdateClassDTO} data - New data to update the class with
   * @param {string} teacherId - ID of the teacher making the request (for authorization)
   * @returns {Promise<Class>} The updated class entity
   * @throws {NotFoundException} If the class is not found
   * @throws {ForbiddenException} If the teacher is not authorized to update this class
   * @throws {ConflictException} If a class with the same name, period, and section already exists
   */
  async execute(id: string, data: IUpdateClassDTO, teacherId: string): Promise<Class> {
    const classExists = await this.classRepository.findById(id);

    if (!classExists) {
      throw new NotFoundException('Classe não encontrada');
    }

    // Verificar se o professor é o dono da turma
    if (classExists.teacherId !== teacherId) {
      throw new ForbiddenException('Você não tem permissão para atualizar esta turma');
    }

    // Verificar se estamos atualizando nome, período ou seção
    if (data.name || data.period || data.section) {
      // Buscar os valores atuais para os campos que não estão sendo atualizados
      const name = data.name || classExists.name;
      const period = data.period || classExists.period;
      const section = data.section || classExists.section;

      // Verificar se já existe outra turma com a mesma combinação de nome, período e seção para este professor
      const existingClass = await this.classRepository.findByNamePeriodAndTeacher(
        name,
        period,
        teacherId,
        section,
      );

      // Se existir uma turma com essa combinação e não for a mesma que estamos atualizando
      if (existingClass && existingClass.id !== id) {
        throw new ConflictException(
          'Você já possui uma turma com este nome e número neste período',
        );
      }
    }

    return this.classRepository.update(id, data);
  }
}
