/**
 * Update Unit Use Case
 *
 * Implements the business logic for updating an existing unit.
 * Validates permissions, checks for duplicate names, and handles unit updates.
 *
 * @module UnitUseCases
 * @units Domain
 */
import {
  Inject, Injectable, NotFoundException, ForbiddenException, ConflictException,
} from '@nestjs/common';

import { CLASS_REPOSITORY } from '@/modules/classes/classes.providers';
import { IClassRepository } from '@/modules/classes/domain/repositories/class-repository.interface';

import { UNIT_REPOSITORY } from '../../units.providers';
import { Unit } from '../entities/unit.entity';
import { IUnitRepository } from '../repositories/unit-repository.interface';

/**
 * Data transfer object for updating a unit
 *
 * @interface IUpdateUnitDTO
 * @units DTO
 */
export interface IUpdateUnitDTO {
  /**
   * Updated name for the unit
   */
  name?: string;

  /**
   * Updated formula for calculating the unit average
   */
  averageFormula?: string;
}

/**
 * Service for updating an existing unit
 *
 * Handles the business logic for unit updates, including:
 * - Validation that the unit exists
 * - Validation that the class exists
 * - Permission checking (only class owner can update its units)
 * - Ensuring no duplicate unit names within a class
 *
 * @class UpdateUnitUseCase
 * @units UseCase
 */
@Injectable()
export class UpdateUnitUseCase {
  /**
   * Creates an UpdateUnitUseCase instance with required repositories
   *
   * @param {IUnitRepository} unitRepository - Repository for unit data access
   * @param {IClassRepository} classRepository - Repository for class data access
   * @units Constructor
   */
  constructor(
    @Inject(UNIT_REPOSITORY)
    private unitRepository: IUnitRepository,
    @Inject(CLASS_REPOSITORY)
    private classRepository: IClassRepository,
  ) {}

  /**
   * Updates an existing unit if the teacher has permission
   *
   * @param {string} id - The ID of the unit to update
   * @param {IUpdateUnitDTO} data - The data to update on the unit
   * @param {string} teacherId - ID of the teacher requesting the update
   * @returns {Promise<Unit>} The updated unit
   * @throws {NotFoundException} If the unit or class is not found
   * @throws {ForbiddenException} If the teacher doesn't own the class
   * @throws {ConflictException} If another unit with the same name exists in the class
   * @units Execute
   */
  async execute(id: string, data: IUpdateUnitDTO, teacherId: string): Promise<Unit> {
    // Verificar se a unidade existe
    const unit = await this.unitRepository.findById(id);
    if (!unit) {
      throw new NotFoundException('Unidade não encontrada');
    }

    // Verificar se a turma existe
    const classExists = await this.classRepository.findById(unit.classId);
    if (!classExists) {
      throw new NotFoundException('Turma não encontrada');
    }

    // Verificar se o professor é o dono da turma
    if (classExists.teacherId !== teacherId) {
      throw new ForbiddenException(
        'Você não tem permissão para atualizar unidades desta turma',
      );
    }

    // Se estiver atualizando o nome, verificar se já existe outra unidade com o mesmo nome na turma
    if (data.name && data.name !== unit.name) {
      const existingUnit = await this.unitRepository.findByNameAndClassId(
        data.name,
        unit.classId,
      );

      if (existingUnit && existingUnit.id !== id) {
        throw new ConflictException(
          'Já existe uma unidade com este nome nesta turma',
        );
      }
    }

    return this.unitRepository.update(id, data);
  }
}
