/**
 * Get Unit Use Case
 *
 * Implements the business logic for retrieving a unit by its ID.
 * Validates permissions and handles unit retrieval.
 *
 * @module UnitUseCases
 * @units Domain
 */
import {
  Inject, Injectable, NotFoundException, ForbiddenException,
} from '@nestjs/common';

import { CLASS_REPOSITORY } from '@/modules/classes/classes.providers';
import { IClassRepository } from '@/modules/classes/domain/repositories/class-repository.interface';

import { UNIT_REPOSITORY } from '../../units.providers';
import { Unit } from '../entities/unit.entity';
import { IUnitRepository } from '../repositories/unit-repository.interface';

/**
 * Service for retrieving a specific unit
 *
 * Handles the business logic for unit retrieval, including:
 * - Validation that the unit exists
 * - Validation that the class exists
 * - Permission checking (only class owner can view its units)
 *
 * @class GetUnitUseCase
 * @units UseCase
 */
@Injectable()
export class GetUnitUseCase {
  /**
   * Creates a GetUnitUseCase instance with required repositories
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
   * Retrieves a unit by its ID if the teacher has permission
   *
   * @param {string} id - The ID of the unit to retrieve
   * @param {string} teacherId - ID of the teacher requesting the unit
   * @returns {Promise<Unit>} The requested unit
   * @throws {NotFoundException} If the unit or class is not found
   * @throws {ForbiddenException} If the teacher doesn't own the class
   * @units Execute
   */
  async execute(id: string, teacherId: string): Promise<Unit> {
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
        'Você não tem permissão para visualizar esta unidade',
      );
    }

    return unit;
  }
}
