/**
 * Get Evaluation Item Use Case
 *
 * Implements the business logic for retrieving an evaluation item by its ID.
 * Validates permissions and handles item retrieval.
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
 * Service for retrieving a specific evaluation item
 *
 * Handles the business logic for evaluation item retrieval, including:
 * - Validation that the evaluation item exists
 * - Validation that the unit exists
 * - Validation that the class exists
 * - Permission checking (only class owner can view the items)
 *
 * @class GetEvaluationItemUseCase
 * @evaluation-items UseCase
 */
@Injectable()
export class GetEvaluationItemUseCase {
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
   * Retrieves an evaluation item by its ID if the teacher has permission
   *
   * @param {string} id - The ID of the evaluation item to retrieve
   * @param {string} teacherId - ID of the teacher requesting the evaluation item
   * @returns {Promise<EvaluationItem>} The requested evaluation item
   * @throws {NotFoundException} If the evaluation item, unit, or class is not found
   * @throws {ForbiddenException} If the teacher is not the owner of the class
   * @evaluation-items Execute
   */
  async execute(id: string, teacherId: string): Promise<EvaluationItem> {
    const evaluationItem = await this.evaluationItemRepository.findById(id);

    if (!evaluationItem) {
      throw new NotFoundException('Item avaliativo não encontrado');
    }

    // Verificar se a unidade existe
    const unit = await this.unitRepository.findById(evaluationItem.unitId);
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
        'Você não tem permissão para visualizar este item avaliativo',
      );
    }

    return evaluationItem;
  }
}
