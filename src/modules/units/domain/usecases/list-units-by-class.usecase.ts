/**
 * List Units by Class Use Case
 *
 * Implements the business logic for retrieving all units belonging to a specific class.
 * Validates permissions and handles unit listing.
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
 * Service for listing all units in a class
 *
 * Handles the business logic for retrieving all units for a specific class, including:
 * - Validation that the class exists
 * - Permission checking (only class owner can view its units)
 *
 * @class ListUnitsByClassUseCase
 * @units UseCase
 */
@Injectable()
export class ListUnitsByClassUseCase {
  /**
   * Creates a ListUnitsByClassUseCase instance with required repositories
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
   * Lists all units for a specific class if the teacher has permission
   *
   * @param {string} classId - The ID of the class to list units for
   * @param {string} teacherId - ID of the teacher requesting the units
   * @returns {Promise<Unit[]>} Array of units for the specified class
   * @throws {NotFoundException} If the class is not found
   * @throws {ForbiddenException} If the teacher doesn't own the class
   * @units Execute
   */
  async execute(classId: string, teacherId: string): Promise<Unit[]> {
    // Verificar se a turma existe
    const classExists = await this.classRepository.findById(classId);
    if (!classExists) {
      throw new NotFoundException('Turma não encontrada');
    }

    // Verificar se o professor é o dono da turma
    if (classExists.teacherId !== teacherId) {
      throw new ForbiddenException(
        'Você não tem permissão para visualizar as unidades desta turma',
      );
    }

    return this.unitRepository.findByClassId(classId);
  }
}
