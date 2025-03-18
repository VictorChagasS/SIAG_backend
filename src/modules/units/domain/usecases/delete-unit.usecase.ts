/**
 * Delete Unit Use Case
 *
 * Implements the business logic for deleting an existing unit.
 * Validates permissions and handles unit deletion with cascading effects.
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
 * Service for deleting an existing unit
 *
 * Handles the business logic for unit deletion, including:
 * - Validation that the unit exists
 * - Validation that the class exists
 * - Permission checking (only class owner can delete its units)
 * - Cascading deletion of related evaluation items and grades
 *
 * @class DeleteUnitUseCase
 * @units UseCase
 */
@Injectable()
export class DeleteUnitUseCase {
  /**
   * Creates a DeleteUnitUseCase instance with required repositories
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
   * Deletes a unit and all its related evaluation items and grades (cascading).
   * The cascade deletion is managed by Prisma through the onDelete: Cascade configuration
   * in the relationships between Unit -> EvaluationItem -> Grade.
   *
   * @param {string} id - The ID of the unit to delete
   * @param {string} teacherId - ID of the teacher requesting the deletion
   * @returns {Promise<Unit>} The deleted unit (before deletion)
   * @throws {NotFoundException} If the unit or class is not found
   * @throws {ForbiddenException} If the teacher doesn't own the class
   * @units Execute
   */
  async execute(id: string, teacherId: string): Promise<Unit> {
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
        'Você não tem permissão para excluir unidades desta turma',
      );
    }

    // Ao excluir a unidade, todos os itens avaliativos e notas relacionadas
    // serão excluídos automaticamente devido à configuração onDelete: Cascade no Prisma
    await this.unitRepository.delete(id);

    return unit;
  }
}
