/**
 * List Evaluation Items by Unit Use Case
 *
 * Implements the business logic for retrieving all evaluation items belonging to a specific unit.
 * Validates permissions and handles item listing.
 *
 * @module EvaluationItemUseCases
 * @evaluation-items Domain
 */
import {
  Inject, Injectable, NotFoundException, ForbiddenException,
} from '@nestjs/common';

import { CLASS_REPOSITORY } from '@/modules/classes/classes.providers';
import { IClassRepository } from '@/modules/classes/domain/repositories/class-repository.interface';
import { IUnitRepository } from '@/modules/units/domain/repositories/unit-repository.interface';
import { UNIT_REPOSITORY } from '@/modules/units/units.providers';

import { EVALUATION_ITEM_REPOSITORY } from '../../evaluation-items.providers';
import { EvaluationItem } from '../entities/evaluation-item.entity';
import { IEvaluationItemRepository } from '../repositories/evaluation-item-repository.interface';

/**
 * Service for listing all evaluation items in a unit
 *
 * Handles the business logic for retrieving all evaluation items for a specific unit, including:
 * - Validation that the unit exists
 * - Validation that the class exists
 * - Permission checking (only class owner can view its evaluation items)
 *
 * @class ListEvaluationItemsByUnitUseCase
 * @evaluation-items UseCase
 */
@Injectable()
export class ListEvaluationItemsByUnitUseCase {
  /**
   * Creates a use case instance with the required repositories
   *
   * @param {IEvaluationItemRepository} evaluationItemRepository - Repository for evaluation item data access
   * @param {IUnitRepository} unitRepository - Repository for unit data access
   * @param {IClassRepository} classRepository - Repository for class data access
   * @evaluation-items Constructor
   */
  constructor(
    @Inject(EVALUATION_ITEM_REPOSITORY)
    private evaluationItemRepository: IEvaluationItemRepository,
    @Inject(UNIT_REPOSITORY)
    private unitRepository: IUnitRepository,
    @Inject(CLASS_REPOSITORY)
    private classRepository: IClassRepository,
  ) {}

  /**
   * Lists all evaluation items for a specific unit if the teacher has permission
   *
   * @param {string} unitId - The ID of the unit to list evaluation items for
   * @param {string} teacherId - ID of the teacher requesting the evaluation items
   * @returns {Promise<EvaluationItem[]>} Array of evaluation items for the specified unit
   * @throws {NotFoundException} If the unit or class is not found
   * @throws {ForbiddenException} If the teacher doesn't own the class
   * @evaluation-items Execute
   */
  async execute(unitId: string, teacherId: string): Promise<EvaluationItem[]> {
    // Verificar se a unidade existe
    const unit = await this.unitRepository.findById(unitId);
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
        'Você não tem permissão para visualizar os itens avaliativos desta unidade',
      );
    }

    return this.evaluationItemRepository.findByUnitId(unitId);
  }
}
