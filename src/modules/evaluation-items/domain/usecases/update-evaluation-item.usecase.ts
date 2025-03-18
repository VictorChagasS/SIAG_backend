/**
 * Update Evaluation Item Use Case
 *
 * Implements the business logic for updating an existing evaluation item.
 * Validates permissions, checks for duplicate names, and handles item updates.
 *
 * @module EvaluationItemUseCases
 * @evaluation-items Domain
 */
import {
  Inject, Injectable, NotFoundException, ForbiddenException, ConflictException,
} from '@nestjs/common';

import { CLASS_REPOSITORY } from '@/modules/classes/classes.providers';
import { IClassRepository } from '@/modules/classes/domain/repositories/class-repository.interface';
import { IUnitRepository } from '@/modules/units/domain/repositories/unit-repository.interface';
import { UNIT_REPOSITORY } from '@/modules/units/units.providers';

import { EVALUATION_ITEM_REPOSITORY } from '../../evaluation-items.providers';
import { EvaluationItem } from '../entities/evaluation-item.entity';
import { IEvaluationItemRepository } from '../repositories/evaluation-item-repository.interface';

/**
 * Data transfer object for updating an evaluation item
 *
 * @interface IUpdateEvaluationItemDTO
 * @evaluation-items DTO
 */
export interface IUpdateEvaluationItemDTO {
  /**
   * Updated name for the evaluation item
   */
  name?: string;
}

/**
 * Service for updating an existing evaluation item
 *
 * Handles the business logic for evaluation item updates, including:
 * - Validation that the evaluation item exists
 * - Validation that the unit exists
 * - Validation that the class exists
 * - Permission checking (only class owner can update its evaluation items)
 * - Ensuring no duplicate names within the same unit
 *
 * @class UpdateEvaluationItemUseCase
 * @evaluation-items UseCase
 */
@Injectable()
export class UpdateEvaluationItemUseCase {
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
   * Updates an existing evaluation item if the teacher has permission
   *
   * @param {string} id - The ID of the evaluation item to update
   * @param {IUpdateEvaluationItemDTO} data - The data to update on the evaluation item
   * @param {string} teacherId - ID of the teacher requesting the update
   * @returns {Promise<EvaluationItem>} The updated evaluation item
   * @throws {NotFoundException} If the evaluation item, unit, or class is not found
   * @throws {ForbiddenException} If the teacher doesn't own the class
   * @throws {ConflictException} If another evaluation item with the same name exists in the unit
   * @evaluation-items Execute
   */
  async execute(id: string, data: IUpdateEvaluationItemDTO, teacherId: string): Promise<EvaluationItem> {
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
        'Você não tem permissão para atualizar itens avaliativos desta unidade',
      );
    }

    // Se estiver atualizando o nome, verificar se já existe outro item avaliativo com o mesmo nome na unidade
    if (data.name && data.name !== evaluationItem.name) {
      const existingEvaluationItem = await this.evaluationItemRepository.findByNameAndUnitId(
        data.name,
        evaluationItem.unitId,
      );

      if (existingEvaluationItem && existingEvaluationItem.id !== id) {
        throw new ConflictException(
          'Já existe um item avaliativo com este nome nesta unidade',
        );
      }
    }

    return this.evaluationItemRepository.update(id, data);
  }
}
