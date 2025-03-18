/**
 * Delete Evaluation Item Use Case
 *
 * Implements the business logic for deleting an existing evaluation item.
 * Validates permissions and handles item deletion with cascading effects.
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
 * Service for deleting an existing evaluation item
 *
 * Handles the business logic for evaluation item deletion, including:
 * - Validation that the evaluation item exists
 * - Validation that the unit exists
 * - Validation that the class exists
 * - Permission checking (only class owner can delete its evaluation items)
 * - Cascading deletion of related grades
 *
 * @class DeleteEvaluationItemUseCase
 * @evaluation-items UseCase
 */
@Injectable()
export class DeleteEvaluationItemUseCase {
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
   * Deletes an evaluation item if the teacher has permission.
   * The cascade deletion of related grades is handled by the database constraint.
   *
   * @param {string} id - The ID of the evaluation item to delete
   * @param {string} teacherId - ID of the teacher requesting the deletion
   * @returns {Promise<EvaluationItem>} The deleted evaluation item (before deletion)
   * @throws {NotFoundException} If the evaluation item, unit, or class is not found
   * @throws {ForbiddenException} If the teacher doesn't own the class
   * @evaluation-items Execute
   */
  async execute(id: string, teacherId: string): Promise<EvaluationItem> {
    // Verificar se o item avaliativo existe
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
        'Você não tem permissão para excluir itens avaliativos desta unidade',
      );
    }

    await this.evaluationItemRepository.delete(id);

    return evaluationItem;
  }
}
